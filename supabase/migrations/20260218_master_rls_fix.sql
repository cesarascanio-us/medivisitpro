-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MediVisitPro - Master RLS Fix
-- Purpose: Allow Master users to see and manage all data across all organizations
-- 1. Helper function to check if the current user is a Master
CREATE OR REPLACE FUNCTION public.is_master() RETURNS BOOLEAN AS $$
SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id::text = auth.uid()::text
            AND role = 'master'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
-- 2. Organizations: Master can see and manage all
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
CREATE POLICY "Users can view own organization" ON public.organizations FOR
SELECT USING (
        id = get_my_organization_id()
        OR public.is_master()
    );
DROP POLICY IF EXISTS "Master full management organizations" ON public.organizations;
CREATE POLICY "Master full management organizations" ON public.organizations FOR ALL USING (public.is_master());
-- 3. User Roles: Master can see and manage all assignments
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
CREATE POLICY "Org User Roles Access" ON public.user_roles FOR ALL USING (
    public.is_master()
    OR (
        organization_id = get_my_organization_id()
        AND (
            get_my_role() = 'admin'
            OR auth.uid()::text = user_id::text
        )
    )
) WITH CHECK (
    public.is_master()
    OR (
        organization_id = get_my_organization_id()
        AND get_my_role() = 'admin'
        AND role NOT IN ('master', 'admin')
    )
);
-- 4. Profiles: Master can see and manage all
-- Added both id and user_id checks for maximum compatibility with different join styles
DROP POLICY IF EXISTS "Profiles org isolation" ON public.profiles;
CREATE POLICY "Profiles org isolation" ON public.profiles FOR
SELECT USING (
        id::text = auth.uid()::text
        OR user_id::text = auth.uid()::text
        OR organization_id = get_my_organization_id()
        OR public.is_master()
    );
DROP POLICY IF EXISTS "Master full management profiles" ON public.profiles;
CREATE POLICY "Master full management profiles" ON public.profiles FOR ALL USING (public.is_master());
-- 5. System wide data tables: Master can see all for global reporting
-- Visits
DROP POLICY IF EXISTS "Org Visits Access" ON public.visits;
CREATE POLICY "Org Visits Access" ON public.visits FOR ALL USING (
    organization_id = get_my_organization_id()
    OR public.is_master()
) WITH CHECK (
    organization_id = get_my_organization_id()
    OR public.is_master()
);
-- Contacts
DROP POLICY IF EXISTS "Org Contact Access" ON public.contacts;
CREATE POLICY "Org Contact Access" ON public.contacts FOR ALL USING (
    organization_id = get_my_organization_id()
    OR public.is_master()
) WITH CHECK (
    organization_id = get_my_organization_id()
    OR public.is_master()
);
-- Products
DROP POLICY IF EXISTS "Org Products Access" ON public.products;
CREATE POLICY "Org Products Access" ON public.products FOR ALL USING (
    organization_id = get_my_organization_id()
    OR public.is_master()
) WITH CHECK (
    organization_id = get_my_organization_id()
    OR public.is_master()
);
-- 6. Billing & Plans: Master can manage
DROP POLICY IF EXISTS "Master manage billing plans" ON public.billing_plans;
CREATE POLICY "Master manage billing plans" ON public.billing_plans FOR ALL USING (public.is_master());
DROP POLICY IF EXISTS "Master manage subscriptions" ON public.subscriptions;
CREATE POLICY "Master manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_master());
-- 7. Support
DROP POLICY IF EXISTS "Users can manage own tickets" ON public.support_tickets;
CREATE POLICY "Users can manage own tickets" ON public.support_tickets FOR ALL USING (
    user_id::text = auth.uid()::text
    OR organization_id = get_my_organization_id()
    OR public.is_master()
) WITH CHECK (
    user_id::text = auth.uid()::text
    OR organization_id = get_my_organization_id()
    OR public.is_master()
);