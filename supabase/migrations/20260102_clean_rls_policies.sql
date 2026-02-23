-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================


-- Migration: Clean and Standardize RLS Policies (Final Fix)
-- Objective: Remove all conflicting policies and establish a single, recursive-proof logic for Team Visibility.
-- Date: 2026-01-02

-- 1. Ensure the Helper Function Exists and is Secure
CREATE OR REPLACE FUNCTION public.get_auth_user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_user_organization_id() TO authenticated, anon;


-- ==============================================================================
-- CLEANUP: DROP ALL POLICIES to ensure no conflicts
-- ==============================================================================

-- user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.user_roles;
DROP POLICY IF EXISTS "Allow group read access" ON public.user_roles;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Org Profile Access" ON public.profiles;

-- ==============================================================================
-- APPLY NEW CLEAN POLICIES
-- ==============================================================================

-- 1. USER_ROLES (SELECT)
CREATE POLICY "user_roles_select_policy"
ON public.user_roles
FOR SELECT
USING (
  -- Master (God Mode)
  (EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND role = 'master'))
  OR
  -- View Own Data
  (auth.uid() = user_id)
  OR
  -- View Data of Same Organization (using SECURITY DEFINER function to avoid recursion)
  (organization_id = public.get_auth_user_organization_id())
);

-- 2. PROFILES (SELECT)
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (
  -- Master (God Mode)
  (EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND role = 'master'))
  OR
  -- View Own Data
  (auth.uid() = user_id)
  OR
  -- Same Organization Logic
  (EXISTS (
    SELECT 1 
    FROM public.user_roles target_ur
    WHERE target_ur.user_id = profiles.user_id
    AND target_ur.organization_id = public.get_auth_user_organization_id()
  ))
);

-- Note: We are focusing on SELECT visibility. Insert/Update policies for admins/users usually remain unless we want to clean those too.
-- For safety, we only cleaned SELECT/ALL read policies. If Insert/Update are separate, they persist. 
-- However, "Org User Roles Access" was ALL, so we likely removed write access if we don't add it back.

-- Let's enable basic write for self/admin
CREATE POLICY "user_roles_update_policy"
ON public.user_roles
FOR UPDATE
USING (
   (EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND (role = 'master' OR role = 'admin' OR role = 'manager')))
);

CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
USING (
   auth.uid() = user_id
);

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'Clean RLS policies applied. Conflicting rules removed.';
END $$;
