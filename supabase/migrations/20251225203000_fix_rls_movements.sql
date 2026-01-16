-- Migration: Enable CRUD for Sample Movements
-- 1. Enable DELETE Policy (Owner can delete their own movements to fix errors)
DROP POLICY IF EXISTS "Users can delete own movements" ON public.sample_movements;
CREATE POLICY "Users can delete own movements"
ON public.sample_movements
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Update Audit Function to handle DELETE (Revert Stock)
CREATE OR REPLACE FUNCTION public.fn_inventory_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- HANDLE INSERTS (Forward Logic)
    IF (TG_OP = 'INSERT') THEN
        -- Bank Deposit
        IF NEW.movement_type = 'bank_deposit' THEN
            UPDATE public.rep_inventory
            SET quantity = quantity - NEW.quantity, updated_at = now()
            WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
            
            INSERT INTO public.bank_inventory (bank_id, product_id, quantity)
            VALUES (NEW.bank_id, NEW.product_id, NEW.quantity)
            ON CONFLICT (bank_id, product_id)
            DO UPDATE SET quantity = bank_inventory.quantity + EXCLUDED.quantity, updated_at = now();

        -- Treatment Start
        ELSIF NEW.movement_type = 'treatment_start' THEN
            UPDATE public.rep_inventory
            SET quantity = quantity - NEW.quantity, updated_at = now()
            WHERE user_id = NEW.user_id AND product_id = NEW.product_id;

        -- Warehouse In
        ELSIF NEW.movement_type = 'warehouse_in' THEN
            INSERT INTO public.rep_inventory (user_id, product_id, quantity)
            VALUES (NEW.user_id, NEW.product_id, NEW.quantity)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET quantity = rep_inventory.quantity + EXCLUDED.quantity, updated_at = now();
            
        -- Bank Audit Consumption (Deduct from Bank)
        ELSIF NEW.movement_type = 'bank_audit_consumption' THEN
             UPDATE public.bank_inventory
             SET quantity = quantity - NEW.quantity, updated_at = now()
             WHERE bank_id = NEW.bank_id AND product_id = NEW.product_id;
        END IF;
        
        RETURN NEW;

    -- HANDLE DELETES (Revert Logic)
    ELSIF (TG_OP = 'DELETE') THEN
        -- Revert Bank Deposit
        IF OLD.movement_type = 'bank_deposit' THEN
            -- Add back to Rep
            UPDATE public.rep_inventory
            SET quantity = quantity + OLD.quantity, updated_at = now()
            WHERE user_id = OLD.user_id AND product_id = OLD.product_id;
            
            -- Remove from Bank
            UPDATE public.bank_inventory
            SET quantity = quantity - OLD.quantity, updated_at = now()
            WHERE bank_id = OLD.bank_id AND product_id = OLD.product_id;

        -- Revert Treatment Start
        ELSIF OLD.movement_type = 'treatment_start' THEN
            -- Add back to Rep
            UPDATE public.rep_inventory
            SET quantity = quantity + OLD.quantity, updated_at = now()
            WHERE user_id = OLD.user_id AND product_id = OLD.product_id;
            
        -- Revert Warehouse In (Rare, but logic included)
        ELSIF OLD.movement_type = 'warehouse_in' THEN
            UPDATE public.rep_inventory
            SET quantity = quantity - OLD.quantity, updated_at = now()
            WHERE user_id = OLD.user_id AND product_id = OLD.product_id;

        -- Revert Consumption (Restock Bank)
        ELSIF OLD.movement_type = 'bank_audit_consumption' THEN
             UPDATE public.bank_inventory
             SET quantity = quantity + OLD.quantity, updated_at = now()
             WHERE bank_id = OLD.bank_id AND product_id = OLD.product_id;
        END IF;

        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Trigger Definition
DROP TRIGGER IF EXISTS trg_inventory_audit ON public.sample_movements;
CREATE TRIGGER trg_inventory_audit
AFTER INSERT OR DELETE ON public.sample_movements
FOR EACH ROW
EXECUTE FUNCTION public.fn_inventory_audit();
