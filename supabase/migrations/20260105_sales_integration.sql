-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ALIGN WAREHOUSE LOGIC WITH SALES INTEGRATION
-- This migration extends the transfer_orders table and updates the dispatch RPC to be polymorphic

-- 1. Create order type enum if not exists
DO $$ BEGIN
    CREATE TYPE public.transfer_order_type AS ENUM ('transfer', 'direct_sale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1b. Add 'SALE' to warehouse_movement_type
-- We cannot use IF NOT EXISTS inside a DO block for enum values on all pg versions, 
-- but we can use this trick or just standard command as Supabase usually handles it.
-- However, safe way:
ALTER TYPE public.warehouse_movement_type ADD VALUE IF NOT EXISTS 'SALE';

-- 2. Add order_type to transfer_orders
ALTER TABLE public.transfer_orders 
ADD COLUMN IF NOT EXISTS order_type public.transfer_order_type DEFAULT 'transfer';

-- 3. Update warehouse_dispatch to support polymorphic dispatch (Sample Requests and Sales Orders)
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
    v_is_transfer BOOLEAN := FALSE;
BEGIN
    -- Check if it's a sample request or a transfer order
    IF EXISTS (SELECT 1 FROM public.sample_requests WHERE id = p_request_id) THEN
        v_is_transfer := FALSE;
    ELSIF EXISTS (SELECT 1 FROM public.transfer_orders WHERE id = p_request_id) THEN
        v_is_transfer := TRUE;
    ELSE
        RAISE EXCEPTION 'ID de solicitud/pedido no encontrado (%)', p_request_id;
    END IF;

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
            warehouse_id, 
            batch_id, 
            product_id, 
            movement_type, 
            quantity, 
            related_request_id,
            user_id,
            organization_id
        ) VALUES (
            p_warehouse_id, 
            (item->>'batch_id')::uuid, 
            v_product_id, 
            CASE WHEN v_is_transfer THEN 'SALE'::public.warehouse_movement_type ELSE 'OUTBOUND'::public.warehouse_movement_type END,
            -(item->>'quantity')::int, 
            p_request_id, 
            auth.uid(), 
            v_org_id
        );
    END LOOP;

    -- Update Status based on table
    IF v_is_transfer THEN
        UPDATE public.transfer_orders
        SET status = 'sent', -- 'sent' corresponds to "Enviado/In Transit" in TransferOrders UI
            updated_at = now()
        WHERE id = p_request_id;
    ELSE
        UPDATE public.sample_requests
        SET status = 'in_transit',
            delivery_status = 'in_transit',
            updated_at = now()
        WHERE id = p_request_id;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
