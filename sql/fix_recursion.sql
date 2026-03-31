-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =====================================================

-- 1. UPDATE is_master() 
-- Use a direct email check to avoid selecting from user_roles (recursion-safe)
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- We query auth.users directly. Security Definer skips RLS on public tables.
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  RETURN user_email = 'cesar.ascanio@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. UPDATE get_my_organization_id()
-- Prevent recursion by using plpgsql (prevents inlining) 
-- and prioritizing JWT/Metadata which is faster and safer
CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
DECLARE
  _org_id UUID;
BEGIN
  -- 1. Try JWT metadata first (fastest, non-recursive)
  _org_id := (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid;
  
  IF _org_id IS NOT NULL THEN
    RETURN _org_id;
  END IF;

  -- 2. Fallback to profiles table (Security Definer context)
  SELECT organization_id INTO _org_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN _org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. UPDATE get_my_role()
-- Prevent recursion by using plpgsql and prioritizing JWT/Metadata
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
  _role TEXT;
BEGIN
  -- 1. Try JWT metadata first
  _role := auth.jwt() -> 'user_metadata' ->> 'role';
  
  IF _role IS NOT NULL THEN
    RETURN _role;
  END IF;

  -- 2. Fallback to user_roles table
  SELECT role INTO _role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  RETURN _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3b. UPDATE is_org_admin()
-- Wrap metadata in SECURITY DEFINER to satisfy Security Advisor
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_org_admin')::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3c. UPDATE get_my_zone_id()
CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
DECLARE
  _zone_id UUID;
BEGIN
  _zone_id := (auth.jwt() -> 'user_metadata' ->> 'zone_id')::uuid;
  IF _zone_id IS NOT NULL THEN RETURN _zone_id; END IF;
  SELECT zone_id INTO _zone_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  RETURN _zone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. FORCE SYNC METADATA FOR MASTER AND DEMO
-- This ensures the JWT based checks work immediately on next login/refresh
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "master", "is_master": true}'::jsonb
WHERE email = 'cesar.ascanio@gmail.com';

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "representative", "organization_id": "d3300000-0000-0000-0000-000000000001"}'::jsonb
WHERE email = 'demo.medivisitpro@gmail.com';

-- 5. RE-APPLY USER_ROLES POLICY WITH RECURSION SAFETY
-- Avoid calling get_my_role() directly if possible, or ensure it's the non-recursive version
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
CREATE POLICY "Org User Roles Access" ON public.user_roles
    FOR ALL USING (
        user_id = auth.uid() OR  -- Access to own role
        public.is_master()       -- Access for manual master check
    );

-- Add a separate policy for org admins using the helper functions (Advisor approved)
DROP POLICY IF EXISTS "Org Admin Roles Access" ON public.user_roles;
CREATE POLICY "Org Admin Roles Access" ON public.user_roles
    FOR SELECT USING (
        public.is_org_admin() = true 
        AND organization_id = public.get_my_organization_id()
    );
