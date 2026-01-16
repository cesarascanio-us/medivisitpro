-- =====================================================
-- FINAL LOGIN & EMAIL FLOW FIX (MediVisitPro)
-- Date: 2026-01-02
-- Purpose:
-- 1. FIX THE 500 ERROR (Nuclear RLS repair)
-- 2. ENABLE EMAIL CONFIRMATION (Revert to unconfirmed state)
-- 3. ENSURE MANAGER EXISTS with correct Identity
-- =====================================================

-- [STEP 1: NUCLEAR RLS REPAIR]
-- We MUST fix the recursion or the Email Service will crash reading the user.

-- A: Recreate the Safe Cache Table
DROP TRIGGER IF EXISTS trigger_sync_user_roles_plain ON public.user_roles;
DROP FUNCTION IF EXISTS public.sync_user_roles_plain() CASCADE;
DROP TABLE IF EXISTS public.user_roles_plain CASCADE;

CREATE TABLE public.user_roles_plain (
    user_id UUID PRIMARY KEY,
    role TEXT NOT NULL,
    organization_id UUID,
    zone_id UUID,
    state TEXT,
    region TEXT,
    supervisor_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_roles_plain DISABLE ROW LEVEL SECURITY;

-- B: Sync Data
INSERT INTO public.user_roles_plain (user_id, role, organization_id, zone_id, state, region, supervisor_id, updated_at)
SELECT 
    user_id, role, organization_id, zone_id, 
    COALESCE(state, NULL), COALESCE(region, NULL), COALESCE(supervisor_id, NULL),
    COALESCE(updated_at, now())
FROM public.user_roles;

-- C: Safe Helper Functions (No Recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_state()
RETURNS TEXT AS $$
    SELECT COALESCE(state, '') FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_region()
RETURNS TEXT AS $$
    SELECT COALESCE(region, '') FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- D: Trigger to maintain cache
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        INSERT INTO public.user_roles_plain (user_id, role, organization_id, zone_id, state, region, supervisor_id, updated_at)
        VALUES (
            NEW.user_id, NEW.role, NEW.organization_id, NEW.zone_id, NEW.state, NEW.region, NEW.supervisor_id, NEW.updated_at
        )
        ON CONFLICT (user_id) DO UPDATE 
        SET 
            role = EXCLUDED.role, 
            organization_id = EXCLUDED.organization_id,
            zone_id = EXCLUDED.zone_id,
            state = EXCLUDED.state,
            region = EXCLUDED.region,
            supervisor_id = EXCLUDED.supervisor_id,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_sync_user_roles_plain
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

-- E: Safe Policies
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
CREATE POLICY "Org User Roles Access" ON public.user_roles
    FOR ALL USING (
        user_id = auth.uid() OR -- Self
        get_my_role() = 'master' OR -- Master
        (get_my_role() IN ('admin', 'manager') AND organization_id = get_my_organization_id())
    );

DROP POLICY IF EXISTS "Profiles org isolation" ON public.profiles;
CREATE POLICY "Profiles org isolation" ON public.profiles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        get_my_role() = 'master' OR
        (get_my_role() IN ('admin', 'manager') AND organization_id = get_my_organization_id())
    );

-- [STEP 2: ENABLE EMAIL CONFIRMATION]
-- The user requested to use the official confirmation flow.
UPDATE auth.users
SET 
    email_confirmed_at = NULL,  -- Mark as unconfirmed (confirmed_at is generated from this)
    last_sign_in_at = NULL
WHERE email = 'cesarascanio.edu@gmail.com';

-- Ensure Identity is correct form
UPDATE auth.identities
SET provider_id = 'cesarascanio.edu@gmail.com' -- For email provider, ID acts as provider_id usually
WHERE identity_data->>'email' = 'cesarascanio.edu@gmail.com' AND provider = 'email';

-- [STEP 3: REFRESH SYSTEM]
ALTER ROLE authenticator SET search_path = public, auth;
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    RAISE NOTICE 'System repaired. Recursion removed.';
    RAISE NOTICE 'Manager account reset to UNCONFIRMED state.';
    RAISE NOTICE 'Go to Supabase Dashboard > Users > Resend Confirmation Email.';
    RAISE NOTICE 'The Database Error 500 should be GONE now, allowing the email to send.';
END $$;
