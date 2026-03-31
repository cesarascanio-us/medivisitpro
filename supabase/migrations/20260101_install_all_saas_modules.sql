-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ==============================================================================
-- MASTER INSTALLER: ALL SAAS MODULES (Logs, Billing, Alerts, Plans)
-- ==============================================================================
-- This script installs ALL remaining Master Panel tables securely.
-- It handles the schema versions (organization_id vs company_id) automatically.

-- 0. PRE-FLIGHT CHECK: Ensure organizations exists
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Try to add organization_id to profiles just in case
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);


-- =====================================================
-- 1. SYSTEM AUDIT LOGS
-- =====================================================
DROP TABLE IF EXISTS public.system_audit_logs CASCADE;
CREATE TABLE public.system_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies for Logs
DO $$
DECLARE
    use_org_col BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') INTO use_org_col;
    
    -- Master always sees all
    EXECUTE 'CREATE POLICY "Master can view all logs" ON public.system_audit_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''master''))';
    
    -- Allow insert (for system logging)
    EXECUTE 'CREATE POLICY "Users can insert logs" ON public.system_audit_logs FOR INSERT TO authenticated WITH CHECK (true)';
END $$;


-- =====================================================
-- 2. BILLING (Subscriptions & Invoices)
-- =====================================================
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;

CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('Free', 'Starter', 'Pro', 'Enterprise')),
    status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMP WITH TIME ZONE,
    price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')) DEFAULT 'open',
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies for Billing
DO $$
DECLARE
    use_org_col BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') INTO use_org_col;

    -- Master Policies
    EXECUTE 'CREATE POLICY "Master full access subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''master''))';
    EXECUTE 'CREATE POLICY "Master full access invoices" ON public.invoices FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''master''))';

    -- Org Read Policies
    IF use_org_col THEN
        EXECUTE 'CREATE POLICY "Org read subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Org read invoices" ON public.invoices FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
    ELSE
        EXECUTE 'CREATE POLICY "Org read subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Org read invoices" ON public.invoices FOR SELECT TO authenticated USING (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
    END IF;
END $$;


-- =====================================================
-- 3. SYSTEM ALERTS
-- =====================================================
DROP TABLE IF EXISTS public.system_alerts CASCADE;
CREATE TABLE public.system_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- Nullable for global
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
    is_global BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies for Alerts
DO $$
DECLARE
    use_org_col BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') INTO use_org_col;

    -- Master Access
    EXECUTE 'CREATE POLICY "Master full access alerts" ON public.system_alerts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''master''))';

    -- User Read Access
    IF use_org_col THEN
        EXECUTE 'CREATE POLICY "User read alerts" ON public.system_alerts FOR SELECT TO authenticated USING ((is_global = true AND active = true) OR (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND active = true))';
    ELSE
        EXECUTE 'CREATE POLICY "User read alerts" ON public.system_alerts FOR SELECT TO authenticated USING ((is_global = true AND active = true) OR (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND active = true))';
    END IF;
END $$;


-- =====================================================
-- 4. SUBSCRIPTION PLANS (No org dependency)
-- =====================================================
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    interval TEXT CHECK (interval IN ('month', 'year')) DEFAULT 'month',
    features JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Simple Policies (No dynamic SQL needed)
CREATE POLICY "Master full access plans" ON public.subscription_plans
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'master')
    );


-- =====================================================
-- 5. SUPPORT TICKETS
-- =====================================================
DROP TABLE IF EXISTS public.support_tickets CASCADE;
CREATE TABLE public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    category TEXT DEFAULT 'general',
    assigned_to UUID REFERENCES auth.users(id),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies for Tickets
DO $$
DECLARE
    use_org_col BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') INTO use_org_col;

    -- Master Policy
    EXECUTE 'CREATE POLICY "Master full access tickets" ON public.support_tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''master''))';

    -- User Policies
    IF use_org_col THEN
        EXECUTE 'CREATE POLICY "Users can view own org tickets" ON public.support_tickets FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can create tickets for own org" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid())';
    ELSE
        EXECUTE 'CREATE POLICY "Users can view own org tickets" ON public.support_tickets FOR SELECT TO authenticated USING (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can create tickets for own org" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid())';
    END IF;
END $$;
