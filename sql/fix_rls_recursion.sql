-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- MediVisitPro RLS Recursion Fix (V3 - AGGRESSIVE)
-- Resolves: "infinite recursion detected in policy for relation 'user_roles'"
-- =============================================

BEGIN;

-- 1. DROP ALL POTENTIAL POLICIES ON BOTH TABLES
-- This ensures no legacy policies remain to cause loops.
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.user_roles'::regclass) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.polname);
    END LOOP;
    FOR pol IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.user_roles_plain'::regclass) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles_plain', pol.polname);
    END LOOP;
END $$;

-- 2. DISABLE RLS ON THE CACHE TABLE (CRITICAL)
-- To break the recursion, the cache table must be accessible without triggering RLS.
ALTER TABLE public.user_roles_plain DISABLE ROW LEVEL SECURITY;

-- 3. REDEFINE HELPER FUNCTIONS (FORCE NON-RECURSIVE)
-- These must query the plain table and use SECURITY DEFINER to bypass RLS.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 4. ENABLE RLS ON THE MAIN TABLE (SECURE)
-- We use a policy that queries the plain table (which now has no RLS, so no recursion).
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_final" ON public.user_roles
FOR SELECT TO authenticated
USING (
    (auth.uid() = user_id) OR
    (EXISTS (
        SELECT 1 FROM public.user_roles_plain
        WHERE user_id = auth.uid() AND role IN ('master', 'admin', 'manager', 'supervisor')
    ))
);

CREATE POLICY "user_roles_mgmt_final" ON public.user_roles
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles_plain
        WHERE user_id = auth.uid() AND role IN ('master', 'admin')
    )
);

-- 5. ENSURE SYNC TRIGGER IS ACTIVE
-- Re-confirming the trigger from previous migrations is still correct.
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, updated_at)
        VALUES (NEW.user_id, NEW.role, NEW.zone_id, NEW.company_id, NEW.updated_at)
        ON CONFLICT (user_id) DO UPDATE 
        SET role = EXCLUDED.role, zone_id = EXCLUDED.zone_id, company_id = EXCLUDED.company_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sync_user_roles_plain ON public.user_roles;
CREATE TRIGGER trigger_sync_user_roles_plain
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

COMMIT;

-- 6. REFRESH
NOTIFY pgrst, 'reload config';
