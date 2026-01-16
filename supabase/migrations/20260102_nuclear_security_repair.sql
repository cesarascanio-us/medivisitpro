-- =====================================================
-- NUCLEAR SYNC & SECURITY RESET (MediVisitPro)
-- Date: 2026-01-02
-- Purpose: 
-- 1. Fix "Database error querying schema" (Recursion)
-- 2. Fix Master user management (NULL Org Isolation)
-- 3. Ensure manager login success
-- =====================================================

-- [PHASE 1: HARDEN THE CACHE TABLE]
-- This table is the "Single Source of Truth" for security and MUST be non-RLS.
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

-- Turn off RLS for this table (safety first)
ALTER TABLE public.user_roles_plain DISABLE ROW LEVEL SECURITY;

-- Initial Sync
INSERT INTO public.user_roles_plain (user_id, role, organization_id, zone_id, state, region, supervisor_id, updated_at)
SELECT 
    user_id, role, organization_id, zone_id,
    COALESCE(state, NULL), COALESCE(region, NULL), COALESCE(supervisor_id, NULL),
    COALESCE(updated_at, now())
FROM public.user_roles;

-- [PHASE 2: NON-RECURSIVE SECURITY HELPERS]
-- These functions MUST NOT reference user_roles, profiles, or other RLS tables.
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

-- [PHASE 3: DYNAMIC SYNC TRIGGER]
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

-- [PHASE 4: MASTER & ADMIN POLICIES]
-- We use a "Role First" strategy to allow Master and Admin to manage data.

DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
CREATE POLICY "Org User Roles Access" ON public.user_roles
    FOR ALL USING (
        user_id = auth.uid() OR -- You can always see yourself
        get_my_role() = 'master' OR -- Master sees ALL
        (get_my_role() IN ('admin', 'manager') AND organization_id = get_my_organization_id())
    );

DROP POLICY IF EXISTS "Profiles org isolation" ON public.profiles;
CREATE POLICY "Profiles org isolation" ON public.profiles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        get_my_role() = 'master' OR
        (get_my_role() IN ('admin', 'manager') AND organization_id = get_my_organization_id()) OR
        (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
            state = get_my_state() OR region = get_my_region()
        ))
    );

-- [PHASE 5: REPAIR MANAGER ACCOUNT]
-- Ensure the manager exists and has a record in user_roles_plain
DO $$
DECLARE
    m_id UUID;
BEGIN
    SELECT id INTO m_id FROM auth.users WHERE email = 'cesarascanio.edu@gmail.com';
    IF m_id IS NOT NULL THEN
        -- Force record in user_roles if missing
        INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
        VALUES (m_id, 'manager', 'a0000000-0000-0000-0000-000000000001', true)
        ON CONFLICT (user_id) DO UPDATE SET role = 'manager', is_active = true;
        
        -- Force record in user_roles_plain
        INSERT INTO public.user_roles_plain (user_id, role, organization_id)
        VALUES (m_id, 'manager', 'a0000000-0000-0000-0000-000000000001')
        ON CONFLICT (user_id) DO UPDATE SET role = 'manager';
    END IF;
END $$;

-- Reload Cache
NOTIFY pgrst, 'reload schema';
