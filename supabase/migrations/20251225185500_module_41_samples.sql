-- Module 41: Medical Samples and Events Management

-- 1. Create Tables

-- Representative Inventory (Maletín Personal)
CREATE TABLE IF NOT EXISTS public.rep_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Sample Banks (Institucional) - Definition of the bank entity itself (or linking to a Health Center)
CREATE TABLE IF NOT EXISTS public.sample_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    health_center_id UUID REFERENCES public.health_centers(id) ON DELETE SET NULL, -- Optional link to a physical center
    responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who manages this bank
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bank Inventory (Stock Consignado)
CREATE TABLE IF NOT EXISTS public.bank_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_id UUID NOT NULL REFERENCES public.sample_banks(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(bank_id, product_id)
);

-- Sample Requests (Solicitudes de Muestras)
CREATE TABLE IF NOT EXISTS public.sample_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'delivered')) DEFAULT 'pending',
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Request Items (Items de la solicitud)
CREATE TABLE IF NOT EXISTS public.sample_request_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES public.sample_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
    quantity_approved INTEGER CHECK (quantity_approved >= 0)
);

-- Sample Movements (Movimientos de Inventario)
-- Unified ledger for all stock changes
CREATE TYPE sample_movement_type AS ENUM (
    'promotion',       -- Handed to doctor during visit
    'transfer_in',     -- Received from company/warehouse
    'transfer_out',    -- Returned to company
    'treatment_start', -- Handed to patient during Event/Jornada
    'bank_delivery',   -- Delivered to an institutional bank
    'adjustment'       -- Manual correction
);

CREATE TABLE IF NOT EXISTS public.sample_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The rep participating in the movement
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity != 0), -- Positive = IN, Negative = OUT (usually) - SEE LOGIC BELOW
    movement_type sample_movement_type NOT NULL,
    
    -- Context References
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,     -- Associated Visit (Promotion)
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,     -- Associated Event (Treatment Start)
    bank_id UUID REFERENCES public.sample_banks(id) ON DELETE SET NULL, -- Associated Bank (Bank Delivery)
    request_id UUID REFERENCES public.sample_requests(id) ON DELETE SET NULL, -- Associated Request (Transfer In)
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trigger Function for Auto-Inventory Updates
CREATE OR REPLACE FUNCTION public.fn_update_rep_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic: 
    -- If quantity is POSITIVE in movement -> ADD to inventory? 
    -- OR we define convention: 
    --   'transfer_in' (positive qty) -> ADD
    --   'promotion' (positive qty describing amount given) -> SUBTRACT
    --   'treatment_start' (positive qty describing amount given) -> SUBTRACT
    
    -- Let's standardize: The 'quantity' in movement represents the AMOUNT of the transaction.
    -- We need to decide direction based on Type.
    
    DECLARE
        qty_change INTEGER;
    BEGIN
        qty_change := NEW.quantity;

        -- CASE 1: OUTGOING Transactions (Reduce Stock)
        IF NEW.movement_type IN ('promotion', 'transfer_out', 'treatment_start', 'bank_delivery') THEN
            -- Check if sufficient stock exists first (Optional, but good practice. The table CHECK constraint handles negative result)
            
            -- Perform Subtraction
            UPDATE public.rep_inventory
            SET quantity = quantity - qty_change,
                updated_at = now()
            WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
            
            -- If row doesn't exist (stock 0), the UPDATE does nothing. 
            -- We should probably ensure the row exists or rely on application level checks.
            -- If we want to force failure if not enough stock (and row missing), we can check FOUND.
            IF NOT FOUND THEN
                 RAISE EXCEPTION 'Product not found in inventory for this user.';
            END IF;

        -- CASE 2: INCOMING Transactions (Increase Stock)
        ELSIF NEW.movement_type IN ('transfer_in') THEN
            INSERT INTO public.rep_inventory (user_id, product_id, quantity)
            VALUES (NEW.user_id, NEW.product_id, qty_change)
            ON CONFLICT (user_id, product_id) 
            DO UPDATE SET quantity = rep_inventory.quantity + EXCLUDED.quantity, updated_at = now();
            
        -- CASE 3: ADJUSTMENT (Could be pos or neg)
        ELSIF NEW.movement_type = 'adjustment' THEN
             -- For adjustment, we assume the 'quantity' field ALREADY contains the sign (e.g. -5 or +10)
             -- WAIT, to be consistent with above, let's say quantity matches the 'magnitude' and we need another field?
             -- No, simpler: for 'adjustment', quantity is signed. For others, quantity is absolute amount processed.
             -- REVISING: To make it simple and less error prone:
             -- Let 'quantity' in sample_movements ALWAYS be the change delta? 
             -- NO, UIs usually show "I gave 5". Storing "-5" is confusing for reporting "Total Given".
             -- 
             -- DECISION: 'quantity' is always Positive Magnitude of the action.
             -- We multiply by -1 for outgoing.
             
             -- Wait, for Adjustment, we might need a distinct sign. 
             -- Let's Assume Adjustment quantity IS signed in the input if we want full flexibility, 
             -- OR we strictly use 'quantity' as absolute and have 'adjustment_add' / 'adjustment_remove'?
             -- Let's assume for this requirements:
             -- treatment_start/promotion/bank_delivery = SUBTRACT
             -- transfer_in = ADD
             -- transfer_out = SUBTRACT
             
             -- For adjustment, let's treat it as: If user supplies negative quantity in INSERT, it's accepted?
             -- The table check says quantity != 0.
             
             INSERT INTO public.rep_inventory (user_id, product_id, quantity)
             VALUES (NEW.user_id, NEW.product_id, qty_change)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = rep_inventory.quantity + EXCLUDED.quantity, updated_at = now();
             
        END IF;

        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
CREATE TRIGGER trg_update_inventory
AFTER INSERT ON public.sample_movements
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_rep_inventory();

-- 4. RLS Policies (Basic)
ALTER TABLE public.rep_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON public.rep_inventory FOR SELECT USING (auth.uid() = user_id);
-- Allow system/trigger to update, usually users don't update directly, they insert movements. 
-- But for initial seeding or admin, we might allow it. 
-- Restrict direct update to avoid bypassing movements log?
-- For now, allow select.

ALTER TABLE public.sample_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own movements" ON public.sample_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own movements" ON public.sample_movements FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.sample_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View banks" ON public.sample_banks FOR SELECT TO authenticated USING (true);

ALTER TABLE public.bank_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View bank inventory" ON public.bank_inventory FOR SELECT TO authenticated USING (true);

