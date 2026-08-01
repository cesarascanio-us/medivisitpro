-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add missing RLS policies
-- Date: 2026-01-03
-- Addresses "RLS Enabled No Policy" warnings from Security Advisor

-- 1. directory_items
CREATE POLICY "Enable read access for authenticated users" ON public.directory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin/master" ON public.directory_items FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 2. doctor_schedules
CREATE POLICY "Enable read access for authenticated users" ON public.doctor_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.doctor_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update/delete for owners or admins" ON public.doctor_schedules FOR ALL TO authenticated USING (
    (auth.uid() = user_id) OR 
    ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'))
);

-- 3. doctor_scores
CREATE POLICY "Enable read access for authenticated users" ON public.doctor_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin/master" ON public.doctor_scores FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 4. help_articles
CREATE POLICY "Enable read access for authenticated users" ON public.help_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin/master" ON public.help_articles FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 5. fixed_assets (Activos Fijos)
CREATE POLICY "Enable read access for authenticated users" ON public.fixed_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin/master" ON public.fixed_assets FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 6. expense_budgets
CREATE POLICY "Enable read access for authenticated users" ON public.expense_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin/master" ON public.expense_budgets FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 7. Inventory & Samples tables
-- dispensacion_muestras
CREATE POLICY "Read access auth_dm" ON public.dispensacion_muestras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_dm" ON public.dispensacion_muestras FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- dispensacion_pacientes
CREATE POLICY "Read access auth_dp" ON public.dispensacion_pacientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_dp" ON public.dispensacion_pacientes FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- entrega_muestras
CREATE POLICY "Read access auth_em" ON public.entrega_muestras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_em" ON public.entrega_muestras FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- entregas_banco
CREATE POLICY "Read access auth_eb" ON public.entregas_banco FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_eb" ON public.entregas_banco FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- detalle_entrega_banco
CREATE POLICY "Read access auth_deb" ON public.detalle_entrega_banco FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_deb" ON public.detalle_entrega_banco FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- inventario_droguerias
CREATE POLICY "Read access auth_id" ON public.inventario_droguerias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_id" ON public.inventario_droguerias FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- inventario_muestras
CREATE POLICY "Read access auth_im" ON public.inventario_muestras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_im" ON public.inventario_muestras FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
