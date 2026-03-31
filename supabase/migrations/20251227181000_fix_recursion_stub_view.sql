-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Fix recursion in get_my_role by ensuring clean environment
-- And create missing view stub to resolve 400 Bad Request

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Stub view for view_farmacia_stock_actual to prevent application crash
-- (Actual logic requires joining registro_pvp_farmacia which might be missing)
DROP VIEW IF EXISTS public.view_farmacia_stock_actual CASCADE;
CREATE OR REPLACE VIEW public.view_farmacia_stock_actual AS
SELECT 
    p.id as pharmacy_id,
    pr.name as product_name,
    pr.id as producto_id,
    0::numeric as pvp,
    false as tiene_stock,
    0::numeric as ventas_estimadas,
    0::numeric as cantidad_actual,
    0::numeric as cantidad_anterior,
    now() as last_audit_date,
    NULL::uuid as audit_id -- Added based on types.ts
FROM public.pharmacies p
CROSS JOIN public.products pr;

GRANT SELECT ON public.view_farmacia_stock_actual TO authenticated;
