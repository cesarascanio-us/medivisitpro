-- =====================================================
-- ATOMIC SECURITY RESET v3 (Ultra-Clean)
-- =====================================================

-- 1. DROP ALL QUANTIFIED POLICIES IN PUBLIC SCHEMA
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename, schemaname
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. RE-IMPLEMENT AUTH FUNCTIONS (SECURE & NON-RECURSIVE)
-- We use SECURITY DEFINER and SET search_path = '' for maximum security and performance.

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
BEGIN
  -- Direct app_metadata extraction. Secure and non-recursive.
  RETURN (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() -> 'app_metadata' ->> 'role';
EXCEPTION WHEN OTHERS THEN
  RETURN 'representative';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = 'cesar.ascanio@gmail.com') OR (auth.jwt() -> 'app_metadata' ->> 'role' = 'master');
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_org_admin')::boolean, 
                  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'), 
                  false);
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- 3. CORE ISOLATION POLICIES (JWT-BASED)

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_read_policy" ON public.organizations 
    FOR SELECT USING (id = public.get_my_organization_id() OR public.is_master());
CREATE POLICY "org_master_all" ON public.organizations
    FOR ALL USING (public.is_master()) WITH CHECK (public.is_master());

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_read_policy" ON public.profiles
    FOR SELECT USING (user_id = auth.uid() OR organization_id = public.get_my_organization_id() OR public.is_master());
CREATE POLICY "profile_owner_update" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "profile_master_manage" ON public.profiles
    FOR ALL USING (public.is_master()) WITH CHECK (public.is_master());

-- USER ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_read_policy" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid() OR organization_id = public.get_my_organization_id() OR public.is_master());
CREATE POLICY "role_master_manage" ON public.user_roles
    FOR ALL USING (public.is_master()) WITH CHECK (public.is_master());

-- 4. APPLY TO ALL TENANT DATA TABLES (Automatic loop)
-- We only apply to tables that actually HAVE an organization_id column
DO $$ 
DECLARE 
    tab RECORD;
BEGIN
    FOR tab IN (
        SELECT t.tablename 
        FROM pg_tables t
        JOIN information_schema.columns c ON c.table_name = t.tablename AND c.table_schema = t.schemaname
        WHERE t.schemaname = 'public' 
        AND c.column_name = 'organization_id'
        AND t.tablename NOT IN ('organizations', 'profiles', 'user_roles', 'spatial_ref_sys')
    ) LOOP
        -- Generic isolation policy for all other tables
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tab.tablename);
        EXECUTE format('CREATE POLICY "tenant_isolation" ON public.%I FOR ALL USING (organization_id = public.get_my_organization_id() OR public.is_master()) WITH CHECK (organization_id = public.get_my_organization_id() OR public.is_master())', tab.tablename);
    END LOOP;
END $$;

-- 4.5. HARDEN ALL FUNCTIONS (SEARCH_PATH PROTECTION)
DO $$ 
DECLARE 
    func RECORD;
BEGIN
    FOR func IN (
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    ) LOOP
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = ''''', func.proname, func.args);
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some functions could not be altered: %', SQLERRM;
END $$;

-- 5. RE-SYNC DEMO & MASTER METADATA (USING APP_METADATA FOR SECURITY)
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "master", "is_master": true, "is_org_admin": true}'::jsonb,
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"is_master": true}'::jsonb
WHERE email = 'cesar.ascanio@gmail.com';

UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "representative", "organization_id": "d3300000-0000-0000-0000-000000000001", "is_org_admin": false}'::jsonb,
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"organization_id": "d3300000-0000-0000-0000-000000000001"}'::jsonb
WHERE email = 'demo.medivisitpro@gmail.com';
