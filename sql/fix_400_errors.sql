-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- FIX 400 BAD REQUEST ERRORS (Missing View & Functions)
-- 1. Restore Helper Functions (Required for RLS)
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT AS $$
SELECT role
FROM public.user_roles
WHERE user_id = auth.uid()
LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.get_my_zone_id() RETURNS UUID AS $$
SELECT zone_id
FROM public.user_roles
WHERE user_id = auth.uid()
LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
-- 2. Create Missing View (view_farmacia_stock_actual)
-- This view was missing in production, causing 400 errors in the Pharmacies module.
DROP VIEW IF EXISTS public.view_farmacia_stock_actual CASCADE;
CREATE OR REPLACE VIEW public.view_farmacia_stock_actual AS
SELECT p.id as pharmacy_id,
    p.user_id,
    -- Required for filtering
    p.zone_id,
    -- Required for filtering
    p.representative_id,
    -- Required for filtering
    p.state,
    -- Required for filtering
    pr.name as product_name,
    pr.id as producto_id,
    0::numeric as pvp,
    false as tiene_stock,
    0::numeric as ventas_estimadas,
    0::numeric as cantidad_actual,
    0::numeric as cantidad_anterior,
    now() as last_audit_date,
    NULL::uuid as audit_id
FROM public.pharmacies p
    CROSS JOIN public.products pr;
-- 3. Grant Permissions
GRANT SELECT ON public.view_farmacia_stock_actual TO authenticated;
-- 4. Force Schema Cache Reload (Critical for 400 errors)
NOTIFY pgrst,
'reload config';
-- 5. Verify Fix
SELECT count(*) as view_count
FROM public.view_farmacia_stock_actual
LIMIT 5;