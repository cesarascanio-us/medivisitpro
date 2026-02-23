-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- COMPREHENSIVE RECURSION KILLER & SECURITY FIX
-- =====================================================

-- 1. DROP ALL POTENTIAL CONFLICTING POLICIES
-- user_roles
DROP POLICY IF EXISTS "Master Full Access" ON public.user_roles;
DROP POLICY IF EXISTS "Admin Full Access" ON public.user_roles;
DROP POLICY IF EXISTS "RBAC User Roles Select" ON public.user_roles;
DROP POLICY IF EXISTS "RBAC User Roles Management" ON public.user_roles;
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Org Admin Roles Access" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON public.user_roles;

-- profiles
DROP POLICY IF EXISTS "Profiles org isolation" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org Profiles Access" ON public.profiles;

-- 2. RECURSION-SAFE HELPER FUNCTIONS
-- These functions prioritize JWT metadata to avoid table queries during RLS evaluation.
-- When they do query tables, they are SECURITY DEFINER to avoid recursion into the same policy.

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
DECLARE
  _org_id UUID;
BEGIN
  -- Priority 1: JWT Metadata (Non-recursive)
  _org_id := (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid;
  IF _org_id IS NOT NULL THEN RETURN _org_id; END IF;

  -- Priority 2: Direct lookup (Security Definer context bypasses RLS)
  SELECT organization_id INTO _org_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN _org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Priority 1: JWT Metadata
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF _role IS NOT NULL THEN RETURN _role; END IF;

  -- Priority 2: Direct lookup
  SELECT role INTO _role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  RETURN _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN AS $$
BEGIN
  -- Hardcoded check for master email - absolute source of truth
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'cesar.ascanio@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_org_admin')::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. APPLY CLEAN, NON-RECURSIVE POLICIES

-- PROFILES: Simple isolation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile Access" ON public.profiles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id = public.get_my_organization_id() OR
        public.is_master()
    );

CREATE POLICY "Profile Update" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- USER_ROLES: Simple isolation
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Role Access" ON public.user_roles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id = public.get_my_organization_id() OR
        public.is_master()
    );

-- 4. EMERGENCY METADATA SYNC
-- Update target users to have metadata so policies don't even hit the tables
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "master", "is_master": true}'::jsonb
WHERE email = 'cesar.ascanio@gmail.com';

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "representative", "organization_id": "d3300000-0000-0000-0000-000000000001"}'::jsonb
WHERE email = 'demo.medivisitpro@gmail.com';
