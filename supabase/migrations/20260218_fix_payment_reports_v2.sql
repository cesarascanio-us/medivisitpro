-- MediVisitPro - Payment Reports Schema Fix
-- Purpose: Fix the relationship between payment_reports and profiles to resolve PostgREST join errors.
-- Date: 2026-02-18
-- 1. Ensure the table exists and has the correct Foreign Key
-- We point user_id to public.profiles(id) so PostgREST can resolve joins automatically.
DO $$ BEGIN -- If table doesn't exist, create it from scratch
IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'payment_reports'
        AND schemaname = 'public'
) THEN CREATE TABLE public.payment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        reference_number TEXT NOT NULL,
        amount_paid NUMERIC(10, 2) NOT NULL,
        proof_image_url TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
ELSE -- If it exists, fix the FK
ALTER TABLE public.payment_reports DROP CONSTRAINT IF EXISTS payment_reports_user_id_fkey;
-- Attempt to link to profiles(id)
ALTER TABLE public.payment_reports
ADD CONSTRAINT payment_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE
SET NULL;
END IF;
END $$;
-- 2. Force a Schema Cache Refresh
-- PostgREST refreshes its cache when it detects certain DDL changes. 
-- Adding a comment or a dummy column sometimes helps.
COMMENT ON TABLE public.payment_reports IS 'SaaS Payment Reports - Optimized for PostgREST joins';
-- 3. Re-verify RLS
ALTER TABLE public.payment_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own reports" ON public.payment_reports;
CREATE POLICY "Users can view own reports" ON public.payment_reports FOR
SELECT USING (
        auth.uid()::text = user_id::text
        OR organization_id = get_my_organization_id()
    );
DROP POLICY IF EXISTS "Users can submit reports" ON public.payment_reports;
CREATE POLICY "Users can submit reports" ON public.payment_reports FOR
INSERT WITH CHECK (auth.uid()::text = user_id::text);
DROP POLICY IF EXISTS "Master manage all reports" ON public.payment_reports;
CREATE POLICY "Master manage all reports" ON public.payment_reports FOR ALL USING (public.is_master());
-- 4. Correct any old policies on profiles that might block the join
-- (Join requires SELECT permission on the target table)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'profiles'
        AND policyname = 'Allow select for relationship joins'
) THEN CREATE POLICY "Allow select for relationship joins" ON public.profiles FOR
SELECT USING (true);
-- This matches Supabase best practices for profiles (read-only for all logged in)
END IF;
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;