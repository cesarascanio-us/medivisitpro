-- MODULE 52: TRACEABILITY AND VALIDATION FIXES
-- Adds batch tracking to rep inventory and ensures no expired goods are dispatched.

-- 1. Add batch_number to sample_movements for traceability
ALTER TABLE public.sample_movements ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- 2. Update warehouse_dispatch RPC to include Expiration Validation
CREATE OR REPLACE FUNCTION public.warehouse_dispatch(
    p_warehouse_id UUID,
    p_request_id UUID,
    p_items JSONB -- Array of {batch_id, quantity}
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

        -- Check Stock
        IF v_batch_qty < (item->>'quantity')::int THEN
            RAISE EXCEPTION 'Stock insuficiente para el lote %', item->>'batch_id';
        END IF;

        -- Check Expiration
        IF v_expiration < CURRENT_DATE THEN
            RAISE EXCEPTION 'No se puede despachar el lote % porque ha vencido (%)', item->>'batch_id', v_expiration;
        END IF;

        -- Deduct from Warehouse Batch
        UPDATE public.warehouse_batches
        SET quantity = quantity - (item->>'quantity')::int,
            updated_at = now()
        WHERE id = (item->>'batch_id')::uuid;

        -- Log Central Warehouse Movement
        INSERT INTO public.warehouse_movements (
            warehouse_id, batch_id, product_id, movement_type, quantity, reference_id, performed_by, organization_id
        ) VALUES (
            p_warehouse_id, (item->>'batch_id')::uuid, v_product_id, 'OUTBOUND', -(item->>'quantity')::int, p_request_id, auth.uid(), v_org_id
        );
    END LOOP;

    -- Update Request Status to in_transit
    UPDATE public.sample_requests
    SET status = 'in_transit',
        -- delivery_status might not exist in all versions, using status as primary
        updated_at = now()
    WHERE id = p_request_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
