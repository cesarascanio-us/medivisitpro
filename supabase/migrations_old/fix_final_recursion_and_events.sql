-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- FINAL FIX FOR 400 ERROR (RECURSION) AND PERMISSIONS
-- 1. Redefine Helper Functions as SECURITY DEFINER
-- This is CRITICAL: It allows the function to bypass RLS on the tables it queries (user_roles),
-- preventing the infinite loop: RLS -> get_my_org -> query user_roles -> RLS -> ...
CREATE OR REPLACE FUNCTION public.get_my_organization_id() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER -- Runs as owner (postgres), ignoring RLS
SET search_path = public AS $$ BEGIN RETURN (
        SELECT organization_id
        FROM public.user_roles
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$;
CREATE OR REPLACE FUNCTION public.is_master() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER -- Runs as owner (postgres)
SET search_path = public AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
            AND role = 'master'
            AND is_active = true
    );
END;
$$;
-- 2. Clean up EVENTS Policies (Suspected 400 Error Source)
DROP POLICY IF EXISTS "tenant_isolation" ON public.events;
DROP POLICY IF EXISTS "Org Events Access" ON public.events;
CREATE POLICY "Org Events Access" ON public.events FOR
SELECT TO authenticated USING (
        organization_id = get_my_organization_id() -- Now SAFE due to SECURITY DEFINER
        OR is_master() -- Now SAFE
    );
-- 3. Clean up NOTIFICATIONS Policies (Another likely 400 source)
DROP POLICY IF EXISTS "tenant_isolation" ON public.notifications;
DROP POLICY IF EXISTS "Org Notifications Access" ON public.notifications;
CREATE POLICY "Org Notifications Access" ON public.notifications FOR ALL TO authenticated USING (
    organization_id = get_my_organization_id()
    AND user_id = auth.uid()
);
-- 4. Re-verify User Roles Policy (Ensure it's using the function)
DROP POLICY IF EXISTS "Safe View User Roles" ON public.user_roles;
CREATE POLICY "Safe View User Roles" ON public.user_roles FOR
SELECT USING (
        user_id = auth.uid()
        OR organization_id = get_my_organization_id()
    );