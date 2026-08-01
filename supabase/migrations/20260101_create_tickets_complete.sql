-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ==============================================================================
-- ULTRA-SAFE SCRIPT: TICKETS & DEPENDENCIES
-- ==============================================================================
-- This script uses Dynamic SQL to bypass parser validation errors.
-- It ensures tables and columns exist before attempting to reference them in policies.

-- 1. Ensure 'organizations' table exists
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add organization_id to profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'organization_id') THEN
        ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
END $$;

-- 3. Create 'support_tickets' table
CREATE TABLE IF NOT EXISTS public.support_tickets (
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

-- 5. Create Policies safely using Dynamic SQL
-- This prevents "column does not exist" errors during initial parsing
DO $$
BEGIN
    -- Master Policy
    EXECUTE 'DROP POLICY IF EXISTS "Master full access tickets" ON public.support_tickets';
    EXECUTE 'CREATE POLICY "Master full access tickets" ON public.support_tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''master''))';

    -- User View Policy
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own org tickets" ON public.support_tickets';
    EXECUTE 'CREATE POLICY "Users can view own org tickets" ON public.support_tickets FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';

    -- User Create Policy
    EXECUTE 'DROP POLICY IF EXISTS "Users can create tickets for own org" ON public.support_tickets';
    EXECUTE 'CREATE POLICY "Users can create tickets for own org" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))';

    -- User Update Policy
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets';
    EXECUTE 'CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid())';
    
    RAISE NOTICE 'Policies created successfully via dynamic SQL';
END $$;
