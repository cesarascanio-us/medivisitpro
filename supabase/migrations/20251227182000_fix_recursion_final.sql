-- Final fix for RLS Infinite Recursion
-- We create a plain table copy of user_roles to be accessed by helper functions
-- This avoids the Loop: Policy -> Function -> Table -> Policy

-- 1. Create Cache Table (No RLS allowed on this table)
CREATE TABLE IF NOT EXISTS public.user_roles_plain (
    user_id UUID PRIMARY KEY,
    role TEXT NOT NULL,
    zone_id UUID,
    company_id UUID,
    updated_at TIMESTAMPTZ
);

-- 2. Populate it with existing data
INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, updated_at)
SELECT user_id, role, zone_id, company_id, updated_at FROM public.user_roles
ON CONFLICT (user_id) DO UPDATE 
SET role = EXCLUDED.role, zone_id = EXCLUDED.zone_id, company_id = EXCLUDED.company_id;

-- 3. Create Trigger to keep it synced
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, updated_at)
        VALUES (NEW.user_id, NEW.role, NEW.zone_id, NEW.company_id, NEW.updated_at)
        ON CONFLICT (user_id) DO UPDATE 
        SET role = EXCLUDED.role, zone_id = EXCLUDED.zone_id, company_id = EXCLUDED.company_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_user_roles_plain ON public.user_roles;
CREATE TRIGGER trigger_sync_user_roles_plain
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

-- 4. Update Helper Functions to use the Plain Table (Breaking the Recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Force schema cache reload logic (implicitly handled by db push usually)
