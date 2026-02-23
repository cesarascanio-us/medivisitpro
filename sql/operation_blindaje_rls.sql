-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ==========================================
-- OPERACIÓN BLINDAJE: SEGURIDAD RLS CONSOLIDADA
-- ==========================================
-- Este script endurece las políticas de seguridad para garantizar:
-- 1. Aislamiento total entre Organizaciones (Tenants).
-- 2. Acceso global solo para el rol 'master' (definido en BD).
-- 3. Eliminación de recursividad en políticas.
-- 1. FUNCIONES AUXILIARES (SECURITY DEFINER para bypass de recursión)
CREATE OR REPLACE FUNCTION public.is_master(u_id uuid) RETURNS boolean AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = u_id
            AND role = 'master'
            AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
CREATE OR REPLACE FUNCTION public.get_user_org(u_id uuid) RETURNS uuid AS $$ BEGIN RETURN (
        SELECT organization_id
        FROM public.user_roles
        WHERE user_id = u_id
            AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
-- 2. APLICACIÓN DE POLÍTICAS POR TABLA
-- TABLA: contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contacts isolation" ON public.contacts;
DROP POLICY IF EXISTS "Contacts Tenancy" ON public.contacts;
DROP POLICY IF EXISTS "Dashboard Access Policy - Contacts" ON public.contacts;
DROP POLICY IF EXISTS "Blindaje_Isolation_Contacts" ON public.contacts;
CREATE POLICY "Blindaje_Isolation_Contacts" ON public.contacts FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
);
-- TABLA: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles isolation" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Tenancy" ON public.profiles;
DROP POLICY IF EXISTS "Dashboard Access Policy - Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Blindaje_Isolation_Profiles" ON public.profiles;
CREATE POLICY "Blindaje_Isolation_Profiles" ON public.profiles FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
    OR user_id = auth.uid()
);
-- TABLA: visits
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Visits isolation" ON public.visits;
DROP POLICY IF EXISTS "Blindaje_Isolation_Visits" ON public.visits;
CREATE POLICY "Blindaje_Isolation_Visits" ON public.visits FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
);
-- TABLA: transfer_orders
ALTER TABLE public.transfer_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Transfer orders isolation" ON public.transfer_orders;
DROP POLICY IF EXISTS "Blindaje_Isolation_Orders" ON public.transfer_orders;
CREATE POLICY "Blindaje_Isolation_Orders" ON public.transfer_orders FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
);
-- TABLA: products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products isolation" ON public.products;
DROP POLICY IF EXISTS "Blindaje_Isolation_Products" ON public.products;
CREATE POLICY "Blindaje_Isolation_Products" ON public.products FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
);
-- TABLA: user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User roles isolation" ON public.user_roles;
DROP POLICY IF EXISTS "Read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Blindaje_Isolation_Roles" ON public.user_roles;
CREATE POLICY "Blindaje_Isolation_Roles" ON public.user_roles FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
    OR user_id = auth.uid()
);
-- TABLA: zones
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Zones isolation" ON public.zones;
DROP POLICY IF EXISTS "Blindaje_Isolation_Zones" ON public.zones;
CREATE POLICY "Blindaje_Isolation_Zones" ON public.zones FOR ALL TO authenticated USING (
    organization_id = public.get_user_org(auth.uid())
    OR public.is_master(auth.uid())
);
-- TABLA: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Organizations isolation" ON public.organizations;
DROP POLICY IF EXISTS "Blindaje_Isolation_Orgs" ON public.organizations;
CREATE POLICY "Blindaje_Isolation_Orgs" ON public.organizations FOR
SELECT TO authenticated USING (
        id = public.get_user_org(auth.uid())
        OR public.is_master(auth.uid())
    );
-- 3. SALVAGUARDA DE ACCESO (MASTER GLOBAL - SIN VINCULACIÓN A ORGANIZACIÓN)
DO $$
DECLARE u_record RECORD;
BEGIN FOR u_record IN
SELECT id,
    email
FROM auth.users
WHERE email IN (
        'cesar.ascanio@gmail.com',
        'cesarascaniofp.us@gmail.com'
    ) LOOP -- 1. Asegurar perfil (Apunta a user_id para evitar conflictos de llave única)
INSERT INTO public.profiles (
        user_id,
        email,
        first_name,
        last_name,
        organization_id
    )
VALUES (
        u_record.id,
        u_record.email,
        'Admin',
        'Master',
        NULL
    ) ON CONFLICT (user_id) DO
UPDATE
SET organization_id = NULL,
    email = EXCLUDED.email;
-- 2. Asegurar rol Master Global (Sin organization_id)
INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
VALUES (u_record.id, 'master', NULL, true) ON CONFLICT (user_id) DO
UPDATE
SET role = 'master',
    organization_id = NULL;
END LOOP;
END $$;
-- 4. VERIFICACIÓN FINAL
-- Las políticas anteriores garantizan que el Master Global tenga acceso total (OR public.is_master)
-- mientras que los usuarios normales quedan confinados a su organization_id.