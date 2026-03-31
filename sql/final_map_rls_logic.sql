-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- MediVisitPro - Final Map Security & Filtering logic
-- Ensures: Context-aware filtering by Region, State, Zone, and User
-- Resolves: Remaining visibility issues and satisfies recursion breaks
-- =============================================

BEGIN;

-- 1. ENHANCE user_roles_plain CACHE
-- Add missing columns to ensure we can filter by Region and State without recursion
ALTER TABLE public.user_roles_plain ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.user_roles_plain ADD COLUMN IF NOT EXISTS region TEXT;

-- Initial sync for new columns
UPDATE public.user_roles_plain urp
SET state = ur.state, region = ur.region
FROM public.user_roles ur
WHERE urp.user_id = ur.user_id;

-- 2. UPDATE SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, state, region, updated_at)
        VALUES (NEW.user_id, NEW.role, NEW.zone_id, NEW.company_id, NEW.state, NEW.region, NEW.updated_at)
        ON CONFLICT (user_id) DO UPDATE 
        SET role = EXCLUDED.role, 
            zone_id = EXCLUDED.zone_id, 
            company_id = EXCLUDED.company_id,
            state = EXCLUDED.state,
            region = EXCLUDED.region,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. ADD ROBUST HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_my_region()
RETURNS TEXT AS $$
    SELECT region FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_state()
RETURNS TEXT AS $$
    SELECT state FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 4. ENHANCE contacts TABLE
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS region TEXT;

-- 5. APPLY CONTEXT-AWARE CONTACTS RLS
-- This policy considers: Region, State, Zone, and User
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "RBAC Contact Select" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Visibility" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON public.contacts;

CREATE POLICY "contacts_select_policy" ON public.contacts
FOR SELECT TO authenticated
USING (
    -- 1. Master, Admin, Manager: Full Visibility (or company wide)
    (public.get_my_role() IN ('master', 'admin', 'manager')) OR
    
    -- 2. Supervisor / Telemarketing: Filtered by Zone, State OR Region
    (
        public.get_my_role() IN ('supervisor', 'telemarketing') AND 
        (
            (zone_id = public.get_my_zone_id()) OR -- Matching Zone
            (state = public.get_my_state()) OR      -- Matching State
            (region = public.get_my_region())       -- Matching Region
        )
    ) OR
    
    -- 3. Representative: Only their OWN contacts
    (public.get_my_role() = 'representative' AND user_id = auth.uid())
);

-- Management policy (creation/edit)
DROP POLICY IF EXISTS "contacts_mgmt_policy" ON public.contacts;
CREATE POLICY "contacts_mgmt_policy" ON public.contacts
FOR ALL TO authenticated
USING (
    public.get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
    (public.get_my_role() = 'representative' AND user_id = auth.uid())
);

COMMIT;

-- 5. REFRESH
NOTIFY pgrst, 'reload config';
