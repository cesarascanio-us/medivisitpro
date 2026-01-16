-- Migration: Add missing RLS policies (Part 3b: Tables 8-13) - Idempotent Version
-- Date: 2026-01-03

-- 8. pop_assignments
DROP POLICY IF EXISTS "Read access auth_pa" ON public.pop_assignments;
DROP POLICY IF EXISTS "Insert access auth_pa" ON public.pop_assignments;
DROP POLICY IF EXISTS "Full access admin_pa" ON public.pop_assignments;
CREATE POLICY "Read access auth_pa" ON public.pop_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert access auth_pa" ON public.pop_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Full access admin_pa" ON public.pop_assignments FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 9. product_assets
DROP POLICY IF EXISTS "Read access auth_pas" ON public.product_assets;
DROP POLICY IF EXISTS "Full access admin_pas" ON public.product_assets;
CREATE POLICY "Read access auth_pas" ON public.product_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pas" ON public.product_assets FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 10. product_inventory
DROP POLICY IF EXISTS "Read access auth_pi" ON public.product_inventory;
DROP POLICY IF EXISTS "Full access admin_pi" ON public.product_inventory;
CREATE POLICY "Read access auth_pi" ON public.product_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pi" ON public.product_inventory FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 11. product_specialties
DROP POLICY IF EXISTS "Read access auth_psp" ON public.product_specialties;
DROP POLICY IF EXISTS "Full access admin_psp" ON public.product_specialties;
CREATE POLICY "Read access auth_psp" ON public.product_specialties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_psp" ON public.product_specialties FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 12. promotional_cycle_products
DROP POLICY IF EXISTS "Read access auth_pcp" ON public.promotional_cycle_products;
DROP POLICY IF EXISTS "Full access admin_pcp" ON public.promotional_cycle_products;
CREATE POLICY "Read access auth_pcp" ON public.promotional_cycle_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pcp" ON public.promotional_cycle_products FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 13. promotional_cycles
DROP POLICY IF EXISTS "Read access auth_pcy" ON public.promotional_cycles;
DROP POLICY IF EXISTS "Full access admin_pcy" ON public.promotional_cycles;
CREATE POLICY "Read access auth_pcy" ON public.promotional_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pcy" ON public.promotional_cycles FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
