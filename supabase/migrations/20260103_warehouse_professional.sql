-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- 1. ENHANCE WAREHOUSES TABLE
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS storage_conditions JSONB; -- {temp_min: 15, temp_max: 25, humidity_max: 60}
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS compliance_standards TEXT; -- ISO 9001, GWP, etc.

-- 2. ENHANCE BATCHES TABLE
ALTER TABLE public.warehouse_batches ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
ALTER TABLE public.warehouse_batches ADD COLUMN IF NOT EXISTS quality_status TEXT DEFAULT 'pending_review'; -- approved, rejected, pending_review

-- 3. UPDATE INBOUND RPC
CREATE OR REPLACE FUNCTION public.warehouse_inbound(
    p_warehouse_id UUID,
    p_product_id UUID,
    p_batch_number TEXT,
    p_quantity INTEGER,
    p_expiration_date DATE,
    p_manufacturing_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_batch_id UUID;
    v_org_id UUID;
BEGIN
    -- Get Org ID from Warehouse
    SELECT organization_id INTO v_org_id FROM public.warehouses WHERE id = p_warehouse_id;

    -- Create new Batch record for this receipt
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
        p_warehouse_id, 
        p_product_id, 
        p_batch_number, 
        p_quantity, 
        p_expiration_date, 
        p_manufacturing_date,
        v_org_id,
        'approved' -- Auto-approve for now unless specified
    ) RETURNING id INTO v_batch_id;

    -- Log Movement
    INSERT INTO public.warehouse_movements (
        warehouse_id, 
        batch_id, 
        product_id, 
        movement_type, 
        quantity, 
        notes, 
        user_id,             -- Aligning with existing schema schema
        organization_id
    ) VALUES (
        p_warehouse_id, 
        v_batch_id, 
        p_product_id, 
        'inbound_purchase',  -- Aligning with existing schema schema (from types.ts)
        p_quantity, 
        p_notes, 
        auth.uid(), 
        v_org_id
    );

    RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
