-- Fix view_farmacia_stock_actual to provide real data for ROI Module
-- 1. Must use DISTINCT ON to get latest audit per product/pharmacy
-- 2. Must provide columns 'farmacia_id' and 'cantidad' as expected by check_event_eligibility RPC

DROP VIEW IF EXISTS public.view_farmacia_stock_actual CASCADE;

CREATE OR REPLACE VIEW public.view_farmacia_stock_actual AS
SELECT DISTINCT ON (r.pharmacy_id, r.producto_id)
    r.pharmacy_id as farmacia_id,  -- RPC expects farmacia_id
    r.pharmacy_id,                 -- Keep readable alias
    pr.name as product_name,
    r.producto_id,
    r.cantidad_actual as cantidad, -- RPC expects 'cantidad'
    r.cantidad_actual,             -- Keep readable alias
    r.tiene_stock,
    r.pvp,
    r.created_at as last_audit_date
FROM public.registro_pvp_farmacia r
JOIN public.products pr ON r.producto_id = pr.id
ORDER BY r.pharmacy_id, r.producto_id, r.created_at DESC;

-- Enable security invoker for RLS safety
ALTER VIEW public.view_farmacia_stock_actual SET (security_invoker = true);

-- Grant access
GRANT SELECT ON public.view_farmacia_stock_actual TO authenticated;
