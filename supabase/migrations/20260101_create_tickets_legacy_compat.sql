-- ==============================================================================
-- LEGACY COMPATIBILITY SCRIPT: TICKETS
-- ==============================================================================
-- Use this if 'organization_id' keeps failing.
-- It uses the existing 'company_id' from profiles for permissions.

-- 1. Ensure 'organizations' table exists
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create 'support_tickets' table
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

-- 3. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies using LEGACY 'company_id'
-- We query 'company_id' from profiles, assuming it matches the new 'organization_id' reference.

DROP POLICY IF EXISTS "Master full access tickets" ON public.support_tickets;
CREATE POLICY "Master full access tickets" ON public.support_tickets
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'master')
    );

DROP POLICY IF EXISTS "Users can view own org tickets" ON public.support_tickets;
CREATE POLICY "Users can view own org tickets" ON public.support_tickets
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create tickets for own org" ON public.support_tickets;
CREATE POLICY "Users can create tickets for own org" ON public.support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
CREATE POLICY "Users can update own tickets" ON public.support_tickets
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
    );
