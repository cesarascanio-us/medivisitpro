-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add missing RLS policies (Part 1: Main Tables) - Idempotent Version
-- Date: 2026-01-03

-- 1. directory_items
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.directory_items;
DROP POLICY IF EXISTS "Enable full access for admin/master" ON public.directory_items;

CREATE POLICY "Enable read access for authenticated users" ON public.directory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable full access for admin/master" ON public.directory_items FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 2. doctor_schedules
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.doctor_schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.doctor_schedules;
DROP POLICY IF EXISTS "Enable modify for owners or admins" ON public.doctor_schedules;

CREATE POLICY "Enable read access for authenticated users" ON public.doctor_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.doctor_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable modify for owners or admins" ON public.doctor_schedules FOR ALL TO authenticated USING (
    (auth.uid() = user_id) OR 
    ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'))
);

-- 3. doctor_scores
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.doctor_scores;
DROP POLICY IF EXISTS "Enable full access for admin/master" ON public.doctor_scores;

CREATE POLICY "Enable read access for authenticated users" ON public.doctor_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable full access for admin/master" ON public.doctor_scores FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 4. help_articles
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.help_articles;
DROP POLICY IF EXISTS "Enable full access for admin/master" ON public.help_articles;

CREATE POLICY "Enable read access for authenticated users" ON public.help_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable full access for admin/master" ON public.help_articles FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 5. fixed_assets
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.fixed_assets;
DROP POLICY IF EXISTS "Enable full access for admin/master" ON public.fixed_assets;

CREATE POLICY "Enable read access for authenticated users" ON public.fixed_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable full access for admin/master" ON public.fixed_assets FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 6. expense_budgets
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.expense_budgets;
DROP POLICY IF EXISTS "Enable full access for admin/master" ON public.expense_budgets;

CREATE POLICY "Enable read access for authenticated users" ON public.expense_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable full access for admin/master" ON public.expense_budgets FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
