-- MODULE 53: AUDIT & TRACKING SYSTEM
-- Implements robust audit logging for critical tables.

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT now(),
    organization_id UUID NOT NULL
);

-- RLS: Only Masters/Admins can read logs | Everyone can insert (via trigger)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_read_policy" ON public.audit_logs
    FOR SELECT USING (public.is_master() OR  (public.get_my_organization_id() = organization_id AND (auth.jwt() ->> 'role')::text IN ('admin', 'manager')));

CREATE POLICY "audit_insert_policy" ON public.audit_logs
    FOR INSERT WITH CHECK (true); -- Triggers run as security definer usually, but open for system.

-- 2. GENERIC LOGGING FUNCTION
CREATE OR REPLACE FUNCTION public.log_changes() RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_record_id UUID;
    v_op TEXT;
    v_changed_by UUID;
    v_org_id UUID;
BEGIN
    v_op := TG_OP;
    v_changed_by := auth.uid();
    
    -- Extract ID and Data
    IF v_op = 'INSERT' THEN
        v_record_id := NEW.id;
        v_new_data := to_jsonb(NEW);
        v_org_id := NEW.organization_id;
    ELSIF v_op = 'UPDATE' THEN
        v_record_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_org_id := NEW.organization_id;
        
        -- Ignore if no meaningful change (optional optimization, check specific fields?)
        -- IF v_old_data = v_new_data THEN RETURN NEW; END IF;
    ELSIF v_op = 'DELETE' THEN
        v_record_id := OLD.id;
        v_old_data := to_jsonb(OLD);
        v_org_id := OLD.organization_id;
    END IF;

    -- Insert Log
    INSERT INTO public.audit_logs (
        table_name, record_id, operation, old_data, new_data, changed_by, organization_id
    ) VALUES (
        TG_TABLE_NAME, v_record_id, v_op, v_old_data, v_new_data, v_changed_by, v_org_id
    );

    IF v_op = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APPLY TRIGGERS TO CRITICAL TABLES

-- Transfer Orders
DROP TRIGGER IF EXISTS audit_transfer_orders ON public.transfer_orders;
CREATE TRIGGER audit_transfer_orders
AFTER INSERT OR UPDATE OR DELETE ON public.transfer_orders
FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- Rep Inventory (Sensitive stock)
DROP TRIGGER IF EXISTS audit_rep_inventory ON public.rep_inventory;
CREATE TRIGGER audit_rep_inventory
AFTER INSERT OR UPDATE OR DELETE ON public.rep_inventory
FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- Visits (Legal compliance)
DROP TRIGGER IF EXISTS audit_visits ON public.visits;
CREATE TRIGGER audit_visits
AFTER INSERT OR UPDATE OR DELETE ON public.visits
FOR EACH ROW EXECUTE FUNCTION public.log_changes();
