-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Security Advisor Fixes
-- Date: 2026-01-03

-- 1. Enable RLS on tables where it was detected as disabled explicitly
-- "Policy Exists RLS Disabled" errors
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Fix "RLS Disabled in Public" for helper table and ensure it has a policy
ALTER TABLE IF EXISTS public.user_roles_plain ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid conflict on rerun
DROP POLICY IF EXISTS "Allow users to read own plain role" ON public.user_roles_plain;

-- Create basic policy to allow users to read their own role 
-- This is critical because other RLS policies (e.g. specialties) rely on subquerying this table for the current user
CREATE POLICY "Allow users to read own plain role" 
ON public.user_roles_plain FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Optional: Allow Service Role full access (usually default, but good to be explicit if needed, 
-- though implicit bypass exists for service_role usually)

-- 3. Fix "Security Definer View" / Ensure View respects RLS
-- Changing a view to security_invoker = true makes it run with the permissions of the user querying it,
-- ensuring that RLS policies on the underlying tables (doctors, visits, etc.) are enforced.
ALTER VIEW public.view_kpi_zonas SET (security_invoker = true);
