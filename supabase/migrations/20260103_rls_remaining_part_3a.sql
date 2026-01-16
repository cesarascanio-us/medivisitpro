-- Migration: Add missing RLS policies (Part 3a: Tables 1-7) - Idempotent Version
-- Date: 2026-01-03

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
