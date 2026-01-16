-- Migration: Add missing RLS policies (Part 2: Inventory & Samples) - Idempotent Version
-- Date: 2026-01-03

-- dispensacion_muestras
DROP POLICY IF EXISTS "Read access auth_dm" ON public.dispensacion_muestras;
DROP POLICY IF EXISTS "Full access admin_dm" ON public.dispensacion_muestras;

CREATE POLICY "Read access auth_dm" ON public.dispensacion_muestras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_dm" ON public.dispensacion_muestras FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- dispensacion_pacientes
DROP POLICY IF EXISTS "Read access auth_dp" ON public.dispensacion_pacientes;
DROP POLICY IF EXISTS "Full access admin_dp" ON public.dispensacion_pacientes;

CREATE POLICY "Read access auth_dp" ON public.dispensacion_pacientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_dp" ON public.dispensacion_pacientes FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- entrega_muestras
DROP POLICY IF EXISTS "Read access auth_em" ON public.entrega_muestras;
DROP POLICY IF EXISTS "Full access admin_em" ON public.entrega_muestras;

CREATE POLICY "Read access auth_em" ON public.entrega_muestras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_em" ON public.entrega_muestras FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- entregas_banco
DROP POLICY IF EXISTS "Read access auth_eb" ON public.entregas_banco;
DROP POLICY IF EXISTS "Full access admin_eb" ON public.entregas_banco;

CREATE POLICY "Read access auth_eb" ON public.entregas_banco FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_eb" ON public.entregas_banco FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- detalle_entrega_banco
DROP POLICY IF EXISTS "Read access auth_deb" ON public.detalle_entrega_banco;
DROP POLICY IF EXISTS "Full access admin_deb" ON public.detalle_entrega_banco;

CREATE POLICY "Read access auth_deb" ON public.detalle_entrega_banco FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_deb" ON public.detalle_entrega_banco FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- inventario_droguerias
DROP POLICY IF EXISTS "Read access auth_id" ON public.inventario_droguerias;
DROP POLICY IF EXISTS "Full access admin_id" ON public.inventario_droguerias;

CREATE POLICY "Read access auth_id" ON public.inventario_droguerias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_id" ON public.inventario_droguerias FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- inventario_muestras
DROP POLICY IF EXISTS "Read access auth_im" ON public.inventario_muestras;
DROP POLICY IF EXISTS "Full access admin_im" ON public.inventario_muestras;

CREATE POLICY "Read access auth_im" ON public.inventario_muestras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_im" ON public.inventario_muestras FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
