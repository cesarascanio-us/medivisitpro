-- ========================================================================
-- MASTER SECURITY RESTORATION - MEDIVISITPRO
-- Fecha: 2026-05-03
-- Objetivo: Restaurar tablas núcleo, corregir recursión RLS y habilitar RPC
-- ========================================================================

-- [PHASE 1: CORE TABLES]
DO $$
BEGIN
    -- Asegurar organizaciones
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        CREATE TABLE public.organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            settings JSONB DEFAULT '{}'::jsonb
        );
    END IF;

    -- Asegurar Tenant 0
    INSERT INTO public.organizations (id, name, slug)
    VALUES ('00000000-0000-0000-0000-000000000000', 'Sistema Global', 'sistema-global')
    ON CONFLICT (id) DO NOTHING;

    -- Asegurar master_users
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_users') THEN
        CREATE TABLE public.master_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            is_active BOOLEAN DEFAULT TRUE,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Asegurar user_roles
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
            role TEXT NOT NULL DEFAULT 'representative',
            zone_id UUID,
            state TEXT,
            region TEXT,
            supervisor_id UUID,
            is_active BOOLEAN DEFAULT TRUE,
            permissions JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Asegurar caché (Sin RLS)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles_plain') THEN
        CREATE TABLE public.user_roles_plain (
            user_id UUID PRIMARY KEY,
            role TEXT NOT NULL,
            organization_id UUID,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE public.user_roles_plain DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- [PHASE 2: RPC & SECURITY FUNCTIONS]
-- Versión con email (para AuthProvider.tsx)
CREATE OR REPLACE FUNCTION public.is_system_master(p_email TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = LOWER(TRIM(p_email)) AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

-- Versión sin parámetros (para políticas RLS internas)
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

-- Alias is_master para compatibilidad con políticas antiguas
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT public.is_system_master();
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS TEXT SECURITY DEFINER AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_organization_id() 
RETURNS UUID SECURITY DEFINER AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = public;

-- [PHASE 3: PERMISSIONS]
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT ON public.user_roles_plain TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_organization_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_system_master(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_system_master() TO PUBLIC;

-- [PHASE 4: DATA SYNC]
INSERT INTO public.master_users (email, notes) 
VALUES ('cesar.ascanio@gmail.com', 'System Owner Root')
ON CONFLICT (email) DO UPDATE SET is_active = TRUE;

INSERT INTO public.user_roles (user_id, role, organization_id)
SELECT id, 'master', '00000000-0000-0000-0000-000000000000'
FROM auth.users 
WHERE email = 'cesar.ascanio@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'master';

TRUNCATE public.user_roles_plain;
INSERT INTO public.user_roles_plain (user_id, role, organization_id)
SELECT user_id, role, organization_id FROM public.user_roles;

-- [PHASE 5: POLICY REINFORCEMENT]
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Role Access" ON public.user_roles;
CREATE POLICY "Role Access" ON public.user_roles FOR ALL USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid()) IN ('master', 'admin')
);

NOTIFY pgrst, 'reload schema';
