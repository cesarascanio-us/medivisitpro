-- Migration: Add missing RLS policies (Part 3: Remaining Tables) - Idempotent Version
-- Date: 2026-01-03
-- Addresses remaining "RLS Enabled No Policy" warnings

-- 1. inventory_movements
DROP POLICY IF EXISTS "Read access auth_imv" ON public.inventory_movements;
DROP POLICY IF EXISTS "Full access admin_imv" ON public.inventory_movements;
CREATE POLICY "Read access auth_imv" ON public.inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_imv" ON public.inventory_movements FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 2. lista_precios_biofarco
DROP POLICY IF EXISTS "Read access auth_lpb" ON public.lista_precios_biofarco;
DROP POLICY IF EXISTS "Full access admin_lpb" ON public.lista_precios_biofarco;
CREATE POLICY "Read access auth_lpb" ON public.lista_precios_biofarco FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_lpb" ON public.lista_precios_biofarco FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 3. materiales_promocionales
DROP POLICY IF EXISTS "Read access auth_mp" ON public.materiales_promocionales;
DROP POLICY IF EXISTS "Full access admin_mp" ON public.materiales_promocionales;
CREATE POLICY "Read access auth_mp" ON public.materiales_promocionales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_mp" ON public.materiales_promocionales FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 4. pharmacy_drugstore_relations
DROP POLICY IF EXISTS "Read access auth_pdr" ON public.pharmacy_drugstore_relations;
DROP POLICY IF EXISTS "Full access admin_pdr" ON public.pharmacy_drugstore_relations;
CREATE POLICY "Read access auth_pdr" ON public.pharmacy_drugstore_relations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pdr" ON public.pharmacy_drugstore_relations FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 5. pharmacy_reports
DROP POLICY IF EXISTS "Read access auth_pr" ON public.pharmacy_reports;
DROP POLICY IF EXISTS "Insert access auth_pr" ON public.pharmacy_reports;
DROP POLICY IF EXISTS "Full access admin_pr" ON public.pharmacy_reports;
CREATE POLICY "Read access auth_pr" ON public.pharmacy_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert access auth_pr" ON public.pharmacy_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Full access admin_pr" ON public.pharmacy_reports FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 6. pharmacy_stock
DROP POLICY IF EXISTS "Read access auth_ps" ON public.pharmacy_stock;
DROP POLICY IF EXISTS "Full access admin_ps" ON public.pharmacy_stock;
CREATE POLICY "Read access auth_ps" ON public.pharmacy_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_ps" ON public.pharmacy_stock FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 7. pop_assignment_items
DROP POLICY IF EXISTS "Read access auth_pai" ON public.pop_assignment_items;
DROP POLICY IF EXISTS "Full access admin_pai" ON public.pop_assignment_items;
CREATE POLICY "Read access auth_pai" ON public.pop_assignment_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_pai" ON public.pop_assignment_items FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

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
