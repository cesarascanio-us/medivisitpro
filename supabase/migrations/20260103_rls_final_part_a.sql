-- Migration: Add missing RLS policies (Final Part) - Idempotent Version
-- Date: 2026-01-03
-- Addresses remaining "RLS Enabled No Policy" warnings from the latest screenshot

-- 1. promotional_materials
DROP POLICY IF EXISTS "Read access auth_pm" ON public.promotional_materials;
DROP POLICY IF EXISTS "Full access admin_pm" ON public.promotional_materials;
CREATE POLICY "Read access auth_pm" ON public.promotional_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pm" ON public.promotional_materials FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 2. quote_items
DROP POLICY IF EXISTS "Read access auth_qi" ON public.quote_items;
DROP POLICY IF EXISTS "Full access admin_qi" ON public.quote_items;
CREATE POLICY "Read access auth_qi" ON public.quote_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_qi" ON public.quote_items FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 3. registro_pvp_farmacia
DROP POLICY IF EXISTS "Read access auth_rpf" ON public.registro_pvp_farmacia;
DROP POLICY IF EXISTS "Full access admin_rpf" ON public.registro_pvp_farmacia;
CREATE POLICY "Read access auth_rpf" ON public.registro_pvp_farmacia FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_rpf" ON public.registro_pvp_farmacia FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 4. rep_inventory
DROP POLICY IF EXISTS "Read access auth_ri" ON public.rep_inventory;
DROP POLICY IF EXISTS "Full access admin_ri" ON public.rep_inventory;
CREATE POLICY "Read access auth_ri" ON public.rep_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_ri" ON public.rep_inventory FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 5. rep_stats_summary
DROP POLICY IF EXISTS "Read access auth_rss" ON public.rep_stats_summary;
DROP POLICY IF EXISTS "Full access admin_rss" ON public.rep_stats_summary;
CREATE POLICY "Read access auth_rss" ON public.rep_stats_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_rss" ON public.rep_stats_summary FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 6. reposiciones_banco
DROP POLICY IF EXISTS "Read access auth_rb" ON public.reposiciones_banco;
DROP POLICY IF EXISTS "Full access admin_rb" ON public.reposiciones_banco;
CREATE POLICY "Read access auth_rb" ON public.reposiciones_banco FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_rb" ON public.reposiciones_banco FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 7. sales_guides
DROP POLICY IF EXISTS "Read access auth_sg" ON public.sales_guides;
DROP POLICY IF EXISTS "Full access admin_sg" ON public.sales_guides;
CREATE POLICY "Read access auth_sg" ON public.sales_guides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sg" ON public.sales_guides FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 8. sample_banks
DROP POLICY IF EXISTS "Read access auth_sb" ON public.sample_banks;
DROP POLICY IF EXISTS "Full access admin_sb" ON public.sample_banks;
CREATE POLICY "Read access auth_sb" ON public.sample_banks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sb" ON public.sample_banks FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 9. sample_distributions
DROP POLICY IF EXISTS "Read access auth_sd" ON public.sample_distributions;
DROP POLICY IF EXISTS "Full access admin_sd" ON public.sample_distributions;
CREATE POLICY "Read access auth_sd" ON public.sample_distributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sd" ON public.sample_distributions FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 10. sample_inventory
DROP POLICY IF EXISTS "Read access auth_sinv" ON public.sample_inventory;
DROP POLICY IF EXISTS "Full access admin_sinv" ON public.sample_inventory;
CREATE POLICY "Read access auth_sinv" ON public.sample_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sinv" ON public.sample_inventory FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
