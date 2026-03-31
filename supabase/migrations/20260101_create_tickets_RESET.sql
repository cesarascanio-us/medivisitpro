-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ==============================================================================
-- FINAL HARD RESET: TICKETS
-- ==============================================================================
-- This script WIPES any existing tickets table triggers a fresh start.
-- It resolves the "column does not exist" error caused by stale table fragments.

-- 1. CLEANUP (The critical fix)
DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- 2. Ensure 'organizations' table exists
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create 'support_tickets' table (Fresh)
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

-- 4. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Compatible with old schema)
-- We check if profiles uses 'organization_id' OR 'company_id'

DO $$
DECLARE
    use_org_col BOOLEAN;
BEGIN
    -- Check which column exists in profiles
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id')
    INTO use_org_col;

    IF use_org_col THEN
        -- MODERN SCHEMA
        CREATE POLICY "Master full access tickets" ON public.support_tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'master'));
        CREATE POLICY "Users can view own org tickets" ON public.support_tickets FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Users can create tickets for own org" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid());
    ELSE
        -- LEGACY SCHEMA (company_id)
        CREATE POLICY "Master full access tickets" ON public.support_tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'master'));
        CREATE POLICY "Users can view own org tickets" ON public.support_tickets FOR SELECT TO authenticated USING (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Users can create tickets for own org" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;
