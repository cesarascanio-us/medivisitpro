-- =============================================
-- MediVisitPro Supabase Security Hardening (Absolute Final)
-- Eliminating the last 2 "No Policy" Info flags
-- =============================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles_plain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debug_auth_dump ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debug_triggers_dump ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debug_roles_dump ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_products ENABLE ROW LEVEL SECURITY;

-- 2. CONVERT SECURITY DEFINER VIEWS TO SECURITY INVOKER
ALTER VIEW public.view_kpi_zonas SET (security_invoker = on);
ALTER VIEW public.user_visit_series SET (security_invoker = on);
ALTER VIEW public.view_opciones_abastecimiento SET (security_invoker = on);
ALTER VIEW public.view_next_best_action SET (security_invoker = on);
ALTER VIEW public.view_farmacia_stock_actual SET (security_invoker = on);

-- 3. FIX FUNCTION SEARCH PATHS
ALTER FUNCTION public.update_rep_stats_on_visit SET search_path = public;
ALTER FUNCTION public.update_rep_stats_on_order SET search_path = public;
ALTER FUNCTION public.update_rep_stats_on_order_update SET search_path = public;
ALTER FUNCTION public.fn_inventory_audit SET search_path = public;
ALTER FUNCTION public.fn_on_assignment_accepted SET search_path = public;
ALTER FUNCTION public.fn_on_assignment_rejected SET search_path = public;
ALTER FUNCTION public.accept_assignment SET search_path = public;
ALTER FUNCTION public.reject_assignment SET search_path = public;
ALTER FUNCTION public.register_visit_sample_drop SET search_path = public;
ALTER FUNCTION public.deposit_to_sample_bank SET search_path = public;
ALTER FUNCTION public.audit_sample_bank SET search_path = public;
ALTER FUNCTION public.generate_monthly_schedule SET search_path = public;
ALTER FUNCTION public.create_visit_series SET search_path = public;
ALTER FUNCTION public.split_series SET search_path = public;
ALTER FUNCTION public.update_single_visit SET search_path = public;
ALTER FUNCTION public.delete_series SET search_path = public;
ALTER FUNCTION public.fn_update_rep_inventory SET search_path = public;
ALTER FUNCTION public.generate_order_number SET search_path = public;
ALTER FUNCTION public.update_updated_at_column SET search_path = public;
ALTER FUNCTION public.update_modified_column SET search_path = public;
ALTER FUNCTION public.sync_user_roles_plain SET search_path = public;
ALTER FUNCTION public.get_my_role SET search_path = public;
ALTER FUNCTION public.get_my_zone_id SET search_path = public;

-- 4. ULTRA-EXPLICIT POLICIES (One per operation)

-- TABLE: user_roles_plain (Admin Only)
DROP POLICY IF EXISTS "urp_select" ON public.user_roles_plain;
CREATE POLICY "urp_select" ON public.user_roles_plain FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin')));
DROP POLICY IF EXISTS "urp_insert" ON public.user_roles_plain;
CREATE POLICY "urp_insert" ON public.user_roles_plain FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin')));
DROP POLICY IF EXISTS "urp_update" ON public.user_roles_plain;
CREATE POLICY "urp_update" ON public.user_roles_plain FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin')));
DROP POLICY IF EXISTS "urp_delete" ON public.user_roles_plain;
CREATE POLICY "urp_delete" ON public.user_roles_plain FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin')));

-- TABLE: visit_products (Authenticated Users)
DROP POLICY IF EXISTS "vp_select" ON public.visit_products;
CREATE POLICY "vp_select" ON public.visit_products FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "vp_insert" ON public.visit_products;
CREATE POLICY "vp_insert" ON public.visit_products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "vp_update" ON public.visit_products;
CREATE POLICY "vp_update" ON public.visit_products FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "vp_delete" ON public.visit_products;
CREATE POLICY "vp_delete" ON public.visit_products FOR DELETE TO authenticated USING (true);

-- Re-verify sample_requests (just in case)
DROP POLICY IF EXISTS "sr_select" ON public.sample_requests;
CREATE POLICY "sr_select" ON public.sample_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin', 'manager')));
DROP POLICY IF EXISTS "sr_insert" ON public.sample_requests;
CREATE POLICY "sr_insert" ON public.sample_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
DROP POLICY IF EXISTS "sr_update" ON public.sample_requests;
CREATE POLICY "sr_update" ON public.sample_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin', 'manager')));
DROP POLICY IF EXISTS "sr_delete" ON public.sample_requests;
CREATE POLICY "sr_delete" ON public.sample_requests FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('master', 'admin')));

-- 5. REFRESH
NOTIFY pgrst, 'reload config';
