-- MODULE 52: CENTRAL WAREHOUSE LOGISTICS
-- Includes: Warehouses, Batches, Movements, and FEFO Logic

-- 1. WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BATCHES TABLE (Lotes)
CREATE TABLE IF NOT EXISTS public.warehouse_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL, -- Lote Identifier
    quantity INTEGER NOT NULL DEFAULT 0,
    expiration_date DATE NOT NULL,
    received_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    organization_id UUID NOT NULL -- Denormalized for RLS performance
);

-- Ensure columns exist if table already existed without them
ALTER TABLE public.warehouse_batches ADD COLUMN IF NOT EXISTS expiration_date DATE;
ALTER TABLE public.warehouse_batches ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE public.warehouse_batches ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 3. MOVEMENTS TABLE (Kardex)
DO $$ BEGIN
    CREATE TYPE warehouse_movement_type AS ENUM ('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'RETURN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.warehouse_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.warehouse_batches(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    movement_type warehouse_movement_type NOT NULL,
    quantity INTEGER NOT NULL, -- Positive for IN, Negative for OUT
    reference_id UUID, -- Links to sample_requests or purchase_orders
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    organization_id UUID NOT NULL
);

-- 4. VIEW: STOCK AGGREGATE
DROP VIEW IF EXISTS public.view_warehouse_stock;
CREATE OR REPLACE VIEW public.view_warehouse_stock AS
SELECT 
    b.warehouse_id,
    b.product_id,
    p.name as product_name,
    p.category,
    SUM(b.quantity) as total_quantity,
    MIN(b.expiration_date) as next_expiration,
    COUNT(b.id) as batch_count
FROM public.warehouse_batches b
JOIN public.products p ON b.product_id = p.id
WHERE b.quantity > 0
GROUP BY b.warehouse_id, b.product_id, p.name, p.category;

-- 5. RLS POLICIES
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_movements ENABLE ROW LEVEL SECURITY;

-- Warehouses Policies
CREATE POLICY "org_isolation_warehouses" ON public.warehouses
    FOR ALL USING (organization_id = public.get_my_organization_id() OR public.is_master());

-- Batches Policies
CREATE POLICY "org_isolation_batches" ON public.warehouse_batches
    FOR ALL USING (organization_id = public.get_my_organization_id() OR public.is_master());

-- Movements Policies
CREATE POLICY "org_isolation_movements" ON public.warehouse_movements
    FOR ALL USING (organization_id = public.get_my_organization_id() OR public.is_master());

-- 6. RPC: INBOUND TRANSACTION
CREATE OR REPLACE FUNCTION public.warehouse_inbound(
    p_warehouse_id UUID,
    p_product_id UUID,
    p_batch_number TEXT,
    p_quantity INTEGER,
    p_expiration_date DATE,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_batch_id UUID;
    v_org_id UUID;
BEGIN
    -- Get Org ID from Warehouse
    SELECT organization_id INTO v_org_id FROM public.warehouses WHERE id = p_warehouse_id;

    -- Create or Update Batch (If batch exists for product/warehouse, update qty?)
    -- Usually batches are unique per receipt, but if same lot number arrives again:
    INSERT INTO public.warehouse_batches (
        warehouse_id, product_id, batch_number, quantity, expiration_date, organization_id
    ) VALUES (
        p_warehouse_id, p_product_id, p_batch_number, p_quantity, p_expiration_date, v_org_id
    ) RETURNING id INTO v_batch_id;

    -- Log Movement
    INSERT INTO public.warehouse_movements (
        warehouse_id, batch_id, product_id, movement_type, quantity, notes, performed_by, organization_id
    ) VALUES (
        p_warehouse_id, v_batch_id, p_product_id, 'INBOUND', p_quantity, p_notes, auth.uid(), v_org_id
    );

    RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: DISPATCH TRANSACTION (FEFO)
CREATE OR REPLACE FUNCTION public.warehouse_dispatch(
    p_warehouse_id UUID,
    p_request_id UUID,
    p_items JSONB -- Array of {batch_id, quantity}
) RETURNS BOOLEAN AS $$
DECLARE
    item JSONB;
    v_batch_qty INTEGER;
    v_org_id UUID;
    v_product_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id FROM public.warehouses WHERE id = p_warehouse_id;

    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Verify Stock
        SELECT quantity, product_id INTO v_batch_qty, v_product_id 
        FROM public.warehouse_batches WHERE id = (item->>'batch_id')::uuid;

        IF v_batch_qty < (item->>'quantity')::int THEN
            RAISE EXCEPTION 'Insufficient stock for batch %', item->>'batch_id';
        END IF;

        -- Deduct from Batch
        UPDATE public.warehouse_batches
        SET quantity = quantity - (item->>'quantity')::int,
            updated_at = now()
        WHERE id = (item->>'batch_id')::uuid;

        -- Log Movement
        INSERT INTO public.warehouse_movements (
            warehouse_id, batch_id, product_id, movement_type, quantity, reference_id, performed_by, organization_id
        ) VALUES (
            p_warehouse_id, (item->>'batch_id')::uuid, v_product_id, 'OUTBOUND', -(item->>'quantity')::int, p_request_id, auth.uid(), v_org_id
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
