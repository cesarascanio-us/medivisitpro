-- ========================================================================
-- SECURITY CACHE ENHANCEMENT (V10)
-- Objetivo: Añadir company_id a la caché y asegurar sincronización total
-- ========================================================================

-- 1. AÑADIR COLUMNA FALTANTE A LA CACHÉ
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles_plain' AND column_name = 'company_id') THEN
        ALTER TABLE public.user_roles_plain ADD COLUMN company_id UUID;
    END IF;
END $$;

-- 2. ACTUALIZAR FUNCIÓN DE SINCRONIZACIÓN
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain() 
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.user_roles_plain (user_id, role, organization_id, company_id, state, region, supervisor_id, zone_id)
    VALUES (NEW.user_id, NEW.role, NEW.organization_id, NEW.company_id, NEW.state, NEW.region, NEW.supervisor_id, NEW.zone_id)
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        organization_id = EXCLUDED.organization_id,
        company_id = EXCLUDED.company_id,
        state = EXCLUDED.state,
        region = EXCLUDED.region,
        supervisor_id = EXCLUDED.supervisor_id,
        zone_id = EXCLUDED.zone_id,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RE-SINCRONIZACIÓN MASIVA
TRUNCATE public.user_roles_plain;
INSERT INTO public.user_roles_plain (user_id, role, organization_id, company_id, state, region, supervisor_id, zone_id)
SELECT user_id, role, organization_id, company_id, state, region, supervisor_id, zone_id FROM public.user_roles;

-- 4. PERMISOS
GRANT SELECT ON public.user_roles_plain TO PUBLIC;

NOTIFY pgrst, 'reload schema';
