-- ========================================================================
-- MASTER GOD MODE RLS FIX - MEDIVISITPRO
-- Fecha: 2026-05-03
-- Objetivo: Garantizar que el usuario 'master' vea TODA la información
-- ========================================================================

-- 1. Recrear las funciones de maestro para asegurar que estén correctas
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT public.is_system_master();
$$ LANGUAGE sql STABLE SET search_path = public;

-- 2. Asegurarse de que el usuario root esté activo
INSERT INTO public.master_users (email, notes, is_active) 
VALUES ('cesar.ascanio@gmail.com', 'System Owner Root', TRUE)
ON CONFLICT (email) DO UPDATE SET is_active = TRUE;

-- 3. FORZAR POLÍTICAS "GOD MODE" EN TABLAS TRANSACCIONALES PRINCIPALES

-- CONTACTS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Contact Access" ON public.contacts;
DROP POLICY IF EXISTS "Tenant isolation" ON public.contacts;
DROP POLICY IF EXISTS "Enable read access for users" ON public.contacts;

CREATE POLICY "Master_God_Mode_Contacts" ON public.contacts FOR ALL USING (
    public.is_system_master() OR 
    organization_id = public.get_my_organization_id()
);

-- VISITS
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Visits Access" ON public.visits;
DROP POLICY IF EXISTS "Tenant isolation" ON public.visits;

CREATE POLICY "Master_God_Mode_Visits" ON public.visits FOR ALL USING (
    public.is_system_master() OR 
    organization_id = public.get_my_organization_id()
);

-- ZONES
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Zones Access" ON public.zones;
DROP POLICY IF EXISTS "Tenant isolation" ON public.zones;

CREATE POLICY "Master_God_Mode_Zones" ON public.zones FOR ALL USING (
    public.is_system_master() OR 
    organization_id = public.get_my_organization_id()
);

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Master full management organizations" ON public.organizations;

CREATE POLICY "Master_God_Mode_Orgs" ON public.organizations FOR ALL USING (
    public.is_system_master() OR 
    id = public.get_my_organization_id()
);

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles org isolation" ON public.profiles;

CREATE POLICY "Master_God_Mode_Profiles" ON public.profiles FOR ALL USING (
    public.is_system_master() OR 
    id = auth.uid() OR
    organization_id = public.get_my_organization_id()
);

-- TRANSFER ORDERS (Si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transfer_orders') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Org Transfer Orders Access" ON public.transfer_orders;';
        EXECUTE 'CREATE POLICY "Master_God_Mode_TransferOrders" ON public.transfer_orders FOR ALL USING (
            public.is_system_master() OR 
            organization_id = public.get_my_organization_id()
        );';
    END IF;
END $$;

-- 4. Notificar a PostgREST
NOTIFY pgrst, 'reload schema';
