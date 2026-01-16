-- =============================================
-- FIX RLS POLICIES FOR PHARMACIES TABLE
-- =============================================

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Admins view all pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Supervisors view pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Supervisors view region pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Reps view own pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can insert pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can update pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can delete pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "pharmacy_select_master" ON public.pharmacies;
DROP POLICY IF EXISTS "pharmacy_select_supervisor" ON public.pharmacies;
DROP POLICY IF EXISTS "pharmacy_select_rep" ON public.pharmacies;

-- Enable RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- Master/Admin can view ALL pharmacies
CREATE POLICY "Admins view all pharmacies"
ON public.pharmacies
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- Supervisors can view pharmacies
CREATE POLICY "Supervisors view pharmacies"
ON public.pharmacies
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

-- Representatives can view their own pharmacies
CREATE POLICY "Reps view own pharmacies"
ON public.pharmacies
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert policy - any authenticated user
CREATE POLICY "Users can insert pharmacies"
ON public.pharmacies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update policy
CREATE POLICY "Users can update pharmacies"
ON public.pharmacies
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

-- Delete policy
CREATE POLICY "Users can delete pharmacies"
ON public.pharmacies
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- Reload config
NOTIFY pgrst, 'reload config';
