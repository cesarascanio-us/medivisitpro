-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add missing RLS policies (Final Part B: Remaining 3 tables) - Idempotent Version
-- Date: 2026-01-03

-- 11. sample_movements
DROP POLICY IF EXISTS "Read access auth_sm" ON public.sample_movements;
DROP POLICY IF EXISTS "Full access admin_sm" ON public.sample_movements;
CREATE POLICY "Read access auth_sm" ON public.sample_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sm" ON public.sample_movements FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 12. sample_request_items
DROP POLICY IF EXISTS "Read access auth_sri" ON public.sample_request_items;
DROP POLICY IF EXISTS "Full access admin_sri" ON public.sample_request_items;
CREATE POLICY "Read access auth_sri" ON public.sample_request_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Full access admin_sri" ON public.sample_request_items FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));

-- 13. sample_requests
DROP POLICY IF EXISTS "Read access auth_sr" ON public.sample_requests;
DROP POLICY IF EXISTS "Insert access auth_sr" ON public.sample_requests;
DROP POLICY IF EXISTS "Full access admin_sr" ON public.sample_requests;
CREATE POLICY "Read access auth_sr" ON public.sample_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert access auth_sr" ON public.sample_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Full access admin_sr" ON public.sample_requests FOR ALL TO authenticated USING ((SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master', 'manager'));
