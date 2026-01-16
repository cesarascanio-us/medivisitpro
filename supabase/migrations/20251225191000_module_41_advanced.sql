-- Module 41 Advanced Logistics Refinement

-- 1. Update Sample Banks Table
-- We assume 'health_centers' exists and serves as the hospital/institution entity
ALTER TABLE public.sample_banks 
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS last_audit_date TIMESTAMP WITH TIME ZONE;

-- Ensure health_center_id is used as the link to institutions
-- (Already exists from previous migration, but reinforcing the link concept)

-- 2. Update Bank Inventory Table
ALTER TABLE public.bank_inventory
ADD COLUMN IF NOT EXISTS min_stock_alert INTEGER DEFAULT 10;

-- 3. Update Sample Movement Types
-- PostgreSQL ENUMs cannot be easily altered in a transaction block to add multiple values cleanly if they don't exist
-- We will add them safely.
ALTER TYPE sample_movement_type ADD VALUE IF NOT EXISTS 'warehouse_in';
ALTER TYPE sample_movement_type ADD VALUE IF NOT EXISTS 'visit_drop';
ALTER TYPE sample_movement_type ADD VALUE IF NOT EXISTS 'bank_deposit';
ALTER TYPE sample_movement_type ADD VALUE IF NOT EXISTS 'bank_audit_consumption';
-- 'treatment_start' was added in previous migration, but ensuring logic handles it

-- 4. Create Audit Trigger Function
CREATE OR REPLACE FUNCTION public.fn_inventory_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Bank Deposit: Rep moves stock from Maletin to Bank
    IF NEW.movement_type = 'bank_deposit' THEN
        -- 1. Deduct from Rep Inventory
        UPDATE public.rep_inventory
        SET quantity = quantity - NEW.quantity,
            updated_at = now()
        WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
        
        IF NOT FOUND THEN
             RAISE EXCEPTION 'Product not found in rep inventory (User ID: %, Product ID: %)', NEW.user_id, NEW.product_id;
        END IF;

        -- 2. Add to Bank Inventory
        INSERT INTO public.bank_inventory (bank_id, product_id, quantity)
        VALUES (NEW.bank_id, NEW.product_id, NEW.quantity)
        ON CONFLICT (bank_id, product_id)
        DO UPDATE SET quantity = bank_inventory.quantity + EXCLUDED.quantity, updated_at = now();

    -- Treatment Start: Rep gives stock to Patient (via Event)
    ELSIF NEW.movement_type = 'treatment_start' THEN
        -- Deduct from Rep Inventory
        UPDATE public.rep_inventory
        SET quantity = quantity - NEW.quantity,
            updated_at = now()
        WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
        
        IF NOT FOUND THEN
             RAISE EXCEPTION 'Product not found in rep inventory (User ID: %, Product ID: %)', NEW.user_id, NEW.product_id;
        END IF;
        
        -- Enforce Event ID presence
        IF NEW.event_id IS NULL THEN
            RAISE EXCEPTION 'treatment_start movement requires a valid event_id';
        END IF;

    -- Bank Audit Consumption: Stock consumed in Hospital (No Rep inventory change, just logging)
    ELSIF NEW.movement_type = 'bank_audit_consumption' THEN
        -- Logic: The quantity represents consumption, so we DEDUCT from Bank Inventory
        -- Note: movement quantity should be positive, logic here handles the deduction
         UPDATE public.bank_inventory
         SET quantity = quantity - NEW.quantity,
             updated_at = now()
         WHERE bank_id = NEW.bank_id AND product_id = NEW.product_id;

    -- Warehouse In: Adding stock to Rep
    ELSIF NEW.movement_type = 'warehouse_in' THEN
        INSERT INTO public.rep_inventory (user_id, product_id, quantity)
        VALUES (NEW.user_id, NEW.product_id, NEW.quantity)
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET quantity = rep_inventory.quantity + EXCLUDED.quantity, updated_at = now();

    -- Visit Drop: Standard promotion
    ELSIF NEW.movement_type = 'visit_drop' THEN
         UPDATE public.rep_inventory
         SET quantity = quantity - NEW.quantity,
             updated_at = now()
         WHERE user_id = NEW.user_id AND product_id = NEW.product_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Trigger
DROP TRIGGER IF EXISTS trg_inventory_audit ON public.sample_movements;
CREATE TRIGGER trg_inventory_audit
AFTER INSERT ON public.sample_movements
FOR EACH ROW
EXECUTE FUNCTION public.fn_inventory_audit();

-- Disable previous simplified trigger if it conflicts, or ensure this one covers all logic
DROP TRIGGER IF EXISTS trg_update_inventory ON public.sample_movements;
-- The new function covers the old logic + new logic, so we replace the old trigger completely.
