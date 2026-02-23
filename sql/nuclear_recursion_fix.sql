-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- NUCLEAR RLS RECURSION REMOVAL
-- =====================================================

-- 1. DROP ALL EXISTING POLICIES ON CORE TABLES
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('user_roles', 'profiles', 'organizations')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. REDEFINE CORE POLICIES WITHOUT FUNCTIONS
-- We use direct auth.jwt() and auth.uid() access to prevent any recursion.

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Select" ON public.organizations 
    FOR SELECT USING (
        id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid OR 
        auth.jwt() ->> 'email' = 'cesar.ascanio@gmail.com'
    );

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile Select" ON public.profiles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid OR
        auth.jwt() ->> 'email' = 'cesar.ascanio@gmail.com'
    );

CREATE POLICY "Profile Update" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

-- USER_ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Role Select" ON public.user_roles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid OR
        auth.jwt() ->> 'email' = 'cesar.ascanio@gmail.com'
    );

-- 3. UPDATE METADATA (CRITICAL)
-- Ensure both users have the necessary "Passport" information in their JWT
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "master", "is_master": true}'::jsonb
WHERE email = 'cesar.ascanio@gmail.com';

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "representative", "organization_id": "d3300000-0000-0000-0000-000000000001"}'::jsonb
WHERE email = 'demo.medivisitpro@gmail.com';

-- 4. CLEANUP FUNCTIONS (Optional but good for health)
CREATE OR REPLACE FUNCTION public.get_my_organization_id() RETURNS UUID AS $$ 
  SELECT (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT AS $$ 
  SELECT auth.jwt() -> 'user_metadata' ->> 'role';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_master() RETURNS BOOLEAN AS $$ 
  SELECT auth.jwt() ->> 'email' = 'cesar.ascanio@gmail.com';
$$ LANGUAGE sql STABLE;
