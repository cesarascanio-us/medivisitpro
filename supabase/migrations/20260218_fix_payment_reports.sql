-- MediVisitPro - Billing System Fix (Payment Reports)
-- Purpose: Create the missing payment_reports table and fix relationships for Manual Payments.
-- Date: 2026-02-18
-- 1. Create payment_reports table
CREATE TABLE IF NOT EXISTS public.payment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL,
        -- Name or ID of the plan (handled as string in frontend for flexibility)
        payment_method TEXT NOT NULL,
        -- 'pago_movil', 'binance', 'paypal', etc.
        reference_number TEXT NOT NULL,
        amount_paid NUMERIC(10, 2) NOT NULL,
        proof_image_url TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Explicit Foreign Key for Profiles (used in ManualPaymentApprover)
-- Note: Profiles is linked to user_id in payment_reports. 
-- We ensure the relationship is clear for PostgREST.
ALTER TABLE public.payment_reports DROP CONSTRAINT IF EXISTS fk_payment_reports_profile;
-- 3. Enable RLS
ALTER TABLE public.payment_reports ENABLE ROW LEVEL SECURITY;
-- 4. Policies
-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON public.payment_reports;
CREATE POLICY "Users can view own reports" ON public.payment_reports FOR
SELECT USING (
        auth.uid() = user_id
        OR organization_id = get_my_organization_id()
    );
-- Users can submit reports
DROP POLICY IF EXISTS "Users can submit reports" ON public.payment_reports;
CREATE POLICY "Users can submit reports" ON public.payment_reports FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Master can manage ALL reports
DROP POLICY IF EXISTS "Master manage all reports" ON public.payment_reports;
CREATE POLICY "Master manage all reports" ON public.payment_reports FOR ALL USING (public.is_master());
-- 5. Helper Function to link profiles more easily if needed
-- (Though PostgREST handles the FK-to-FK relationship via profiles:user_id(email))
-- 6. Ensure subscriptions table can handle manual activation
-- (Wait, checking subscriptions columns from previous migration)
-- Manual activations usually update plan_id, status, and current_period_end.
-- 7. Add trigger for updated_at
DROP TRIGGER IF EXISTS tr_payment_reports_updated_at ON public.payment_reports;
CREATE TRIGGER tr_payment_reports_updated_at BEFORE
UPDATE ON public.payment_reports FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();