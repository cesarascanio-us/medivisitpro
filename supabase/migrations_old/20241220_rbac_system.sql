-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MediVisitPro - RBAC System Implementation
-- This migration implements the 5-tier role system and zone-based filtering.

-- 1. ZONES MANAGEMENT
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- 2. ENHANCE TABLES WITH ZONE_ID
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'zone_id') THEN
        ALTER TABLE public.contacts ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visits' AND column_name = 'zone_id') THEN
        ALTER TABLE public.visits ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transfer_orders' AND column_name = 'zone_id') THEN
        ALTER TABLE public.transfer_orders ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'zone_id') THEN
        ALTER TABLE public.expenses ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'zone_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pharmacy_reports' AND column_name = 'zone_id') THEN
        ALTER TABLE public.pharmacy_reports ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'health_centers' AND column_name = 'zone_id') THEN
        ALTER TABLE public.health_centers ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'objectives' AND column_name = 'zone_id') THEN
        ALTER TABLE public.objectives ADD COLUMN zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. HELPER FUNCTIONS FOR RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. REFRESH RLS POLICIES

-- ZONES POLICY
DROP POLICY IF EXISTS "Zones visibility" ON public.zones;
DROP POLICY IF EXISTS "Management can view zones" ON public.zones;
CREATE POLICY "Zones visibility" ON public.zones
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager', 'supervisor')
);

-- CONTACTS POLICY
DROP POLICY IF EXISTS "RBAC Contact Select" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Insert" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Visibility" ON public.contacts;
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
CREATE POLICY "RBAC Contact Select" ON public.contacts
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND (zone_id = get_my_zone_id() OR zone_id IS NULL)) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

CREATE POLICY "RBAC Contact Insert" ON public.contacts
FOR INSERT WITH CHECK (
    get_my_role() IN ('master', 'admin', 'manager', 'supervisor', 'representative')
);

-- VISITS POLICY
DROP POLICY IF EXISTS "RBAC Visits Select" ON public.visits;
DROP POLICY IF EXISTS "Users can view their own visits" ON public.visits;
CREATE POLICY "RBAC Visits Select" ON public.visits
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- EXPENSES POLICY
DROP POLICY IF EXISTS "RBAC Expenses Select" ON public.expenses;
DROP POLICY IF EXISTS "RBAC Expenses Approval" ON public.expenses;
DROP POLICY IF EXISTS "Users can manage own expenses" ON public.expenses;
CREATE POLICY "RBAC Expenses Select" ON public.expenses
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

CREATE POLICY "RBAC Expenses Approval" ON public.expenses
FOR UPDATE USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id())
) WITH CHECK (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id())
);

-- USER ROLES POLICY (Sensitive)
DROP POLICY IF EXISTS "RBAC User Roles Select" ON public.user_roles;
DROP POLICY IF EXISTS "RBAC User Roles Management" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "RBAC User Roles Select" ON public.user_roles
FOR SELECT USING (
    get_my_role() = 'master' OR
    (get_my_role() = 'admin') OR
    (get_my_role() = 'manager') OR
    (auth.uid() = user_id)
);

CREATE POLICY "RBAC User Roles Management" ON public.user_roles
FOR ALL USING (
    get_my_role() = 'master' OR 
    (get_my_role() = 'admin' AND role NOT IN ('master', 'admin'))
);

-- TRANSFER ORDERS POLICY
DROP POLICY IF EXISTS "RBAC Transfer Orders Select" ON public.transfer_orders;
DROP POLICY IF EXISTS "Users can manage own transfer orders" ON public.transfer_orders;
CREATE POLICY "RBAC Transfer Orders Select" ON public.transfer_orders
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- PHARMACY REPORTS POLICY
DROP POLICY IF EXISTS "RBAC Pharmacy Reports Select" ON public.pharmacy_reports;
CREATE POLICY "RBAC Pharmacy Reports Select" ON public.pharmacy_reports
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- HEALTH CENTERS POLICY
DROP POLICY IF EXISTS "RBAC Health Centers Select" ON public.health_centers;
CREATE POLICY "RBAC Health Centers Select" ON public.health_centers
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- OBJECTIVES POLICY
DROP POLICY IF EXISTS "RBAC Objectives Select" ON public.objectives;
CREATE POLICY "RBAC Objectives Select" ON public.objectives
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- PRODUCTS MANAGEMENT (Strict)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products Select" ON public.products;
DROP POLICY IF EXISTS "Products Management" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Products Select" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Products Management" ON public.products
FOR ALL USING (get_my_role() IN ('master', 'admin', 'manager'));

-- 5. INITIAL ZONES (Optional/Example)
-- INSERT INTO public.zones (name) VALUES ('Zona Norte'), ('Zona Sur'), ('Zona Este'), ('Zona Oeste');
