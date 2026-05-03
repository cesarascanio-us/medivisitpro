-- ========================================================================
-- REPARACIÓN INTEGRAL DE SEGURIDAD (V3 - AUTODETECCIÓN)
-- Fecha: 2026-05-03
-- Objetivo: Sincronizar roles desde cualquier fuente disponible (user_roles o profiles)
-- ========================================================================

DO $$
BEGIN
    -- 1. Asegurar tabla de caché
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles_plain') THEN
        CREATE TABLE public.user_roles_plain (
            user_id UUID PRIMARY KEY,
            role TEXT NOT NULL,
            organization_id UUID,
            zone_id UUID,
            state TEXT,
            region TEXT,
            supervisor_id UUID,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE public.user_roles_plain DISABLE ROW LEVEL SECURITY;
    END IF;

    -- 2. Sincronizar desde la fuente disponible (Manejo de redundancia)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        RAISE NOTICE 'Sincronizando desde user_roles...';
        INSERT INTO public.user_roles_plain (user_id, role, organization_id, zone_id, state, region, supervisor_id)
        SELECT user_id, role, organization_id, zone_id, state, region, supervisor_id FROM public.user_roles
        ON CONFLICT (user_id) DO UPDATE SET 
            role = EXCLUDED.role, 
            organization_id = EXCLUDED.organization_id,
            zone_id = EXCLUDED.zone_id,
            state = EXCLUDED.state,
            region = EXCLUDED.region;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'Sincronizando desde profiles (fallback)...';
        -- Intentar detectar si profiles tiene la columna role
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
            INSERT INTO public.user_roles_plain (user_id, role, organization_id)
            SELECT id, COALESCE(role, 'representative'), organization_id FROM public.profiles
            ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, organization_id = EXCLUDED.organization_id;
        ELSE
            -- Si no hay columna role, insertamos un default para no romper el sistema
            INSERT INTO public.user_roles_plain (user_id, role, organization_id)
            SELECT id, 'representative', organization_id FROM public.profiles
            ON CONFLICT (user_id) DO UPDATE SET organization_id = EXCLUDED.organization_id;
        END IF;
    END IF;
END $$;

-- 3. Re-crear funciones críticas con SECURITY DEFINER apuntando a la CACHÉ
CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS TEXT SECURITY DEFINER AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_organization_id() 
RETURNS UUID SECURITY DEFINER AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_system_master(p_email TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = LOWER(TRIM(p_email))
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. Otorgar permisos de ejecución explícitos
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_organization_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_system_master(p_email TEXT) TO anon, authenticated, service_role;

-- 5. Permisos de tabla y esquema
GRANT SELECT ON public.user_roles_plain TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 6. Recargar caché de PostgREST
NOTIFY pgrst, 'reload schema';
