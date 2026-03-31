-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Optimization and Security Hardening
-- Date: 2024-12-23
-- Purpose: Create KPI views and refine RLS for Telemarketing

-- =====================================================
-- 1. Create KPI View (Optimization)
-- =====================================================
CREATE OR REPLACE VIEW view_kpi_zonas AS
SELECT 
    z.id as zone_id,
    z.name as zone_name,
    COUNT(t.id) as total_orders,
    COALESCE(SUM(t.total), 0) as total_amount,
    COUNT(DISTINCT t.user_id) as active_reps
FROM zones z
LEFT JOIN transfer_orders t ON z.id = t.zone_id
GROUP BY z.id, z.name;

-- Grant access to the view
GRANT SELECT ON view_kpi_zonas TO authenticated;

-- =====================================================
-- 2. Add Telemarketing Role Support
-- =====================================================
-- Telemarketing users should see data for their assigned zone (like Supervisors)

-- Update Contacts Policy
DROP POLICY IF EXISTS "RBAC Contact Select" ON public.contacts;
CREATE POLICY "RBAC Contact Select" ON public.contacts
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() IN ('supervisor', 'telemarketing') AND (zone_id = get_my_zone_id() OR zone_id IS NULL)) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- Update Visits Policy
DROP POLICY IF EXISTS "RBAC Visits Select" ON public.visits;
CREATE POLICY "RBAC Visits Select" ON public.visits
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() IN ('supervisor', 'telemarketing') AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- Update Transfer Orders Policy
DROP POLICY IF EXISTS "RBAC Transfer Orders Select" ON public.transfer_orders;
CREATE POLICY "RBAC Transfer Orders Select" ON public.transfer_orders
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() IN ('supervisor', 'telemarketing') AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- Update Objectives Policy
DROP POLICY IF EXISTS "RBAC Objectives Select" ON public.objectives;
CREATE POLICY "RBAC Objectives Select" ON public.objectives
FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() IN ('supervisor', 'telemarketing') AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- =====================================================
-- 3. Update get_my_role() to being robust
-- =====================================================
-- Ensure the helper function is optimized
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
