-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- FIX: Resolve "Database error querying schema" on login

-- 1. Ensure 'is_active' exists in user_roles (just in case)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Reset RLS policies on user_roles to prevent infinite recursion
DROP POLICY IF EXISTS "Users manage own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can select own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update non-master roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

-- 3. Create Safe, Non-Recursive Policies

-- Policy A: Users can read their own role (Basic Login Requirement)
CREATE POLICY "Read Own Role" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy B: Admins/Managers can read ALL roles (Dashboard Requirement)
-- Uses auth.jwt() metadata to avoid querying the table itself (recursion breaker)
CREATE POLICY "Management Read All Roles" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin', 'manager', 'supervisor')
    );

-- Policy C: Master/Admin can update/insert/delete roles
CREATE POLICY "Management Modify Roles" ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin')
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('master', 'admin')
    );

