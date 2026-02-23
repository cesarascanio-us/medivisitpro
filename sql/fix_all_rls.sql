-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- FIX RLS POLICIES FOR ALL MAIN TABLES
-- Master/Admin see all, Supervisors see region, Reps see own
-- =============================================

-- =============================================
-- 1. CONTACTS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Supervisors view zone contacts" ON public.contacts;
DROP POLICY IF EXISTS "Supervisors view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Reps view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON public.contacts;

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all contacts"
ON public.contacts FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

CREATE POLICY "Supervisors view contacts"
ON public.contacts FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

CREATE POLICY "Reps view own contacts"
ON public.contacts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert contacts"
ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update contacts"
ON public.contacts FOR UPDATE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

CREATE POLICY "Users can delete contacts"
ON public.contacts FOR DELETE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- =============================================
-- 2. HEALTH_CENTERS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins view all health_centers" ON public.health_centers;
DROP POLICY IF EXISTS "Supervisors view health_centers" ON public.health_centers;
DROP POLICY IF EXISTS "Reps view own health_centers" ON public.health_centers;
DROP POLICY IF EXISTS "Users can insert health_centers" ON public.health_centers;
DROP POLICY IF EXISTS "Users can update health_centers" ON public.health_centers;
DROP POLICY IF EXISTS "Users can delete health_centers" ON public.health_centers;

ALTER TABLE public.health_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all health_centers"
ON public.health_centers FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

CREATE POLICY "Supervisors view health_centers"
ON public.health_centers FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

CREATE POLICY "Reps view own health_centers"
ON public.health_centers FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert health_centers"
ON public.health_centers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update health_centers"
ON public.health_centers FOR UPDATE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

CREATE POLICY "Users can delete health_centers"
ON public.health_centers FOR DELETE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- =============================================
-- 3. EXPENSES TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Supervisors view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Reps view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON public.expenses;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all expenses"
ON public.expenses FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

CREATE POLICY "Supervisors view expenses"
ON public.expenses FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

CREATE POLICY "Reps view own expenses"
ON public.expenses FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert expenses"
ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update expenses"
ON public.expenses FOR UPDATE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

CREATE POLICY "Users can delete expenses"
ON public.expenses FOR DELETE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- =============================================
-- 4. TRANSFER_ORDERS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins view all transfer_orders" ON public.transfer_orders;
DROP POLICY IF EXISTS "Supervisors view transfer_orders" ON public.transfer_orders;
DROP POLICY IF EXISTS "Reps view own transfer_orders" ON public.transfer_orders;
DROP POLICY IF EXISTS "Users can insert transfer_orders" ON public.transfer_orders;
DROP POLICY IF EXISTS "Users can update transfer_orders" ON public.transfer_orders;
DROP POLICY IF EXISTS "Users can delete transfer_orders" ON public.transfer_orders;

ALTER TABLE public.transfer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all transfer_orders"
ON public.transfer_orders FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

CREATE POLICY "Supervisors view transfer_orders"
ON public.transfer_orders FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

CREATE POLICY "Reps view own transfer_orders"
ON public.transfer_orders FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert transfer_orders"
ON public.transfer_orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update transfer_orders"
ON public.transfer_orders FOR UPDATE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

CREATE POLICY "Users can delete transfer_orders"
ON public.transfer_orders FOR DELETE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- =============================================
-- 5. VISITS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admins view all visits" ON public.visits;
DROP POLICY IF EXISTS "Supervisors view visits" ON public.visits;
DROP POLICY IF EXISTS "Reps view own visits" ON public.visits;
DROP POLICY IF EXISTS "Users can insert visits" ON public.visits;
DROP POLICY IF EXISTS "Users can update visits" ON public.visits;
DROP POLICY IF EXISTS "Users can delete visits" ON public.visits;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all visits"
ON public.visits FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

CREATE POLICY "Supervisors view visits"
ON public.visits FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

CREATE POLICY "Reps view own visits"
ON public.visits FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert visits"
ON public.visits FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update visits"
ON public.visits FOR UPDATE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

CREATE POLICY "Users can delete visits"
ON public.visits FOR DELETE TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- Reload PostgREST config
NOTIFY pgrst, 'reload config';
