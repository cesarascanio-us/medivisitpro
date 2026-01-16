-- Migration: Add missing RLS policies (Final Part C: Last 9 tables) - Idempotent Version
-- Date: 2026-01-03
-- Addresses remaining "RLS Enabled No Policy" warnings from the latest screenshot

-- 1. samples
DROP POLICY IF EXISTS "Read access auth_sam" ON public.samples;
DROP POLICY IF EXISTS "Full access admin_sam" ON public.samples;
CREATE POLICY "Read access auth_sam" ON public.samples FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sam" ON public.samples FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 2. system_documents
DROP POLICY IF EXISTS "Read access auth_sysdoc" ON public.system_documents;
DROP POLICY IF EXISTS "Full access admin_sysdoc" ON public.system_documents;
CREATE POLICY "Read access auth_sysdoc" ON public.system_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sysdoc" ON public.system_documents FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 3. transfer_order_history
DROP POLICY IF EXISTS "Read access auth_toh" ON public.transfer_order_history;
DROP POLICY IF EXISTS "Full access admin_toh" ON public.transfer_order_history;
CREATE POLICY "Read access auth_toh" ON public.transfer_order_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_toh" ON public.transfer_order_history FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 4. transfer_order_items
DROP POLICY IF EXISTS "Read access auth_toi" ON public.transfer_order_items;
DROP POLICY IF EXISTS "Full access admin_toi" ON public.transfer_order_items;
CREATE POLICY "Read access auth_toi" ON public.transfer_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_toi" ON public.transfer_order_items FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 5. user_favorites (Users manage their own)
DROP POLICY IF EXISTS "Read access auth_uf" ON public.user_favorites;
DROP POLICY IF EXISTS "Manage own auth_uf" ON public.user_favorites;
DROP POLICY IF EXISTS "Full access admin_uf" ON public.user_favorites;
CREATE POLICY "Read access auth_uf" ON public.user_favorites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage own auth_uf" ON public.user_favorites FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Full access admin_uf" ON public.user_favorites FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 6. visit_products
DROP POLICY IF EXISTS "Read access auth_vp" ON public.visit_products;
DROP POLICY IF EXISTS "Full access admin_vp" ON public.visit_products;
CREATE POLICY "Read access auth_vp" ON public.visit_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_vp" ON public.visit_products FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 7. visit_series
DROP POLICY IF EXISTS "Read access auth_vser" ON public.visit_series;
DROP POLICY IF EXISTS "Full access admin_vser" ON public.visit_series;
CREATE POLICY "Read access auth_vser" ON public.visit_series FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_vser" ON public.visit_series FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 8. weekly_plans (Users manage their own)
DROP POLICY IF EXISTS "Read access auth_wp" ON public.weekly_plans;
DROP POLICY IF EXISTS "Manage own auth_wp" ON public.weekly_plans;
DROP POLICY IF EXISTS "Full access admin_wp" ON public.weekly_plans;
CREATE POLICY "Read access auth_wp" ON public.weekly_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage own auth_wp" ON public.weekly_plans FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Full access admin_wp" ON public.weekly_plans FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 9. work_processes (Users manage their own)
DROP POLICY IF EXISTS "Read access auth_wproc" ON public.work_processes;
DROP POLICY IF EXISTS "Manage own auth_wproc" ON public.work_processes;
DROP POLICY IF EXISTS "Full access admin_wproc" ON public.work_processes;
CREATE POLICY "Read access auth_wproc" ON public.work_processes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage own auth_wproc" ON public.work_processes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Full access admin_wproc" ON public.work_processes FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
