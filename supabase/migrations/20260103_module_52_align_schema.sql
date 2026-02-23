-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ALIGN WAREHOUSE LOGIC WITH EXISTING SCHEMA
-- This ensures the RPC works with the warehouse_movements table as defined in the project types

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

        -- Log Central Warehouse Movement (ALIGNING WITH EXISTING SCHEMA)
        INSERT INTO public.warehouse_movements (
            warehouse_id, 
            batch_id, 
            product_id, 
            movement_type, 
            quantity, 
            related_request_id, -- Used related_request_id instead of reference_id
            user_id,             -- Used user_id instead of performed_by
            organization_id
        ) VALUES (
            p_warehouse_id, 
            (item->>'batch_id')::uuid, 
            v_product_id, 
            'outbound_dispatch', -- Used outbound_dispatch instead of OUTBOUND
            -(item->>'quantity')::int, 
            p_request_id, 
            auth.uid(), 
            v_org_id
        );
    END LOOP;

    -- Update Request Status
    UPDATE public.sample_requests
    SET status = 'in_transit',
        delivery_status = 'in_transit',
        updated_at = now()
    WHERE id = p_request_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
