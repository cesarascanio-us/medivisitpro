-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================


-- Migration: Fix Team Visibility for Managers
-- Objective: Allow users in the same organization to view each other's roles and profiles.
-- Date: 2026-01-02

-- 1. Create Helper Function to avoid Recursion
-- This function gets the current user's organization_id securely.
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


-- 2. Update RLS for user_roles
-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles; -- Just in case

-- Create inclusive policy
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles
FOR SELECT
USING (
  -- Master (God Mode)
  (EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND role = 'master'))
  OR
  -- View Own Role
  (auth.uid() = user_id)
  OR
  -- View Roles of Same Organization
  (organization_id = public.get_auth_user_organization_id())
);


-- 3. Update RLS for profiles
-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Create inclusive policy for profiles
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
USING (
  -- Master (God Mode)
  (EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND role = 'master'))
  OR
  -- View Own Profile
  (auth.uid() = user_id)
  OR
  -- View Profiles of users in Same Organization
  -- We check if the profile's user_id is associated with the current user's org
  (EXISTS (
    SELECT 1 
    FROM public.user_roles target_ur
    WHERE target_ur.user_id = profiles.user_id
    AND target_ur.organization_id = public.get_auth_user_organization_id()
  ))
);

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated for organization visibility.';
END $$;
