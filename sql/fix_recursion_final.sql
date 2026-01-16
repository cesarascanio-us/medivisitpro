-- =====================================================
-- FINAL RLS RECURSION KILLER & METADATA SYNC
-- =====================================================

-- 1. DROP ALL POTENTIAL CONFLICTING POLICIES (Comprehensive)
DROP POLICY IF EXISTS "Profile Access" ON public.profiles;
DROP POLICY IF EXISTS "Profile Update" ON public.profiles;
DROP POLICY IF EXISTS "Role Access" ON public.user_roles;
DROP POLICY IF EXISTS "Org Access" ON public.organizations;

-- 2. RECURSION-FREE HELPER FUNCTIONS
-- These MUST NOT query any table that uses them in their RLS policies.
-- We rely strictly on auth.jwt() which is the "Source of Truth" for the session.

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
BEGIN
  -- Use direct JWT access. Fast, secure, and non-recursive.
  RETURN (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'role';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN AS $$
BEGIN
  -- We use the email from the JWT to avoid querying auth.users during RLS evaluation
  RETURN auth.jwt() ->> 'email' = 'cesar.ascanio@gmail.com';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_org_admin')::boolean, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. APPLY CLEAN, NON-RECURSIVE POLICIES

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Select" ON public.organizations 
    FOR SELECT USING (
        id = public.get_my_organization_id() OR public.is_master()
    );

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile Select" ON public.profiles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id = public.get_my_organization_id() OR
        public.is_master()
    );

-- USER_ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Role Select" ON public.user_roles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id = public.get_my_organization_id() OR
        public.is_master()
    );

-- 4. FORCE METADATA UPDATE
-- This is the CRITICAL STEP. If the user doesn't have metadata, they have no access.
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "master", "is_master": true}'::jsonb
WHERE email = 'cesar.ascanio@gmail.com';

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "representative", "organization_id": "d3300000-0000-0000-0000-000000000001"}'::jsonb
WHERE email = 'demo.medivisitpro@gmail.com';

-- 5. RE-ENABLE RLS EVERYWHERE JUST IN CASE
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;
