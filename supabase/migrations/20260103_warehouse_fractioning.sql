-- 1. ADD NEW MOVEMENT TYPES TO ENUM
-- Note: PostgreSQL doesn't support easy ALTER TYPE for enums inside transactions without COMMIT.
-- We'll use a safer approach checking if they exist.
ALTER TYPE public.warehouse_movement_type ADD VALUE IF NOT EXISTS 'sale';
ALTER TYPE public.warehouse_movement_type ADD VALUE IF NOT EXISTS 'conversion_in';
ALTER TYPE public.warehouse_movement_type ADD VALUE IF NOT EXISTS 'conversion_out';

-- 2. RPC FOR PRODUCT FRACTIONING
CREATE OR REPLACE FUNCTION public.warehouse_fraction_batch(
    p_source_batch_id UUID,
    p_source_quantity_to_reduce INTEGER,
    p_target_product_id UUID,
    p_target_quantity_to_add INTEGER,
    p_notes TEXT DEFAULT 'Product Fractioning/Detailing'
) RETURNS VOID AS $$
DECLARE
    v_source_record RECORD;
    v_org_id UUID;
    v_warehouse_id UUID;
    v_new_batch_id UUID;
BEGIN
    -- 1. Get source batch info
    SELECT * INTO v_source_record FROM public.warehouse_batches WHERE id = p_source_batch_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Source batch not found'; END IF;
    IF v_source_record.quantity < p_source_quantity_to_reduce THEN RAISE EXCEPTION 'Insufficient stock in source batch'; END IF;

    v_org_id := v_source_record.organization_id;
    v_warehouse_id := v_source_record.warehouse_id;

    -- 2. Reduce stock from source batch
    UPDATE public.warehouse_batches 
    SET quantity = quantity - p_source_quantity_to_reduce,
        updated_at = now()
    WHERE id = p_source_batch_id;

    -- 3. Log conversion_out movement
    INSERT INTO public.warehouse_movements (
        warehouse_id, batch_id, product_id, movement_type, quantity, notes, user_id, organization_id
    ) VALUES (
        v_warehouse_id, p_source_batch_id, v_source_record.product_id, 'conversion_out', -p_source_quantity_to_reduce, p_notes, auth.uid(), v_org_id
    );

    -- 4. Create or Update target batch (usually a new batch for the same lot number but different product item)
    -- We'll create a new batch record for the fractioned units to keep it clean
    INSERT INTO public.warehouse_batches (
        warehouse_id, 
        product_id, 
        batch_number, 
        quantity, 
        expiration_date, 
        manufacturing_date, 
        organization_id, 
        quality_status
    ) VALUES (
        v_warehouse_id,
        p_target_product_id,
        v_source_record.batch_number || '-DET', -- Mark as detailed
        p_target_quantity_to_add,
        v_source_record.expiration_date,
        v_source_record.manufacturing_date,
        v_org_id,
        v_source_record.quality_status
    ) RETURNING id INTO v_new_batch_id;

    -- 5. Log conversion_in movement
    INSERT INTO public.warehouse_movements (
        warehouse_id, batch_id, product_id, movement_type, quantity, notes, user_id, organization_id
    ) VALUES (
        v_warehouse_id, v_new_batch_id, p_target_product_id, 'conversion_in', p_target_quantity_to_add, p_notes, auth.uid(), v_org_id
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. RPC FOR DIRECT DISPATCH (SALE/OTHER)
CREATE OR REPLACE FUNCTION public.warehouse_direct_dispatch(
    p_warehouse_id UUID,
    p_movement_type public.warehouse_movement_type,
    p_items JSONB, -- Array of {batch_id, quantity}
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    item JSONB;
    v_batch_qty INTEGER;
    v_expiration DATE;
    v_org_id UUID;
    v_product_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id FROM public.warehouses WHERE id = p_warehouse_id;

    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Verify Stock and Expiration
        SELECT quantity, product_id, expiration_date INTO v_batch_qty, v_product_id, v_expiration
        FROM public.warehouse_batches WHERE id = (item->>'batch_id')::uuid;

        IF v_batch_qty < (item->>'quantity')::int THEN
            RAISE EXCEPTION 'Stock insuficiente para el lote %', item->>'batch_id';
        END IF;

        IF v_expiration < CURRENT_DATE THEN
            RAISE EXCEPTION 'Lote % vencido (%)', item->>'batch_id', v_expiration;
        END IF;

        -- Deduct
        UPDATE public.warehouse_batches
        SET quantity = quantity - (item->>'quantity')::int,
            updated_at = now()
        WHERE id = (item->>'batch_id')::uuid;

        -- Log
        INSERT INTO public.warehouse_movements (
            warehouse_id, batch_id, product_id, movement_type, quantity, notes, user_id, organization_id
        ) VALUES (
            p_warehouse_id, (item->>'batch_id')::uuid, v_product_id, p_movement_type, -(item->>'quantity')::int, p_notes, auth.uid(), v_org_id
        );
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
