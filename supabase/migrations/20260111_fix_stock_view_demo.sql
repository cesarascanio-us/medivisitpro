-- Fix view_farmacia_stock_actual to include user_id/representative_id for filtering
-- Previous definition caused 400 error because filters tried to query 'user_id' which didn't exist
DROP VIEW IF EXISTS public.view_farmacia_stock_actual CASCADE;
CREATE OR REPLACE VIEW public.view_farmacia_stock_actual AS
SELECT DISTINCT ON (r.pharmacy_id, r.producto_id) r.pharmacy_id as farmacia_id,
    r.pharmacy_id,
    pr.name as product_name,
    r.producto_id,
    r.cantidad_actual as cantidad,
    r.cantidad_actual,
    r.tiene_stock,
    r.pvp,
    r.created_at as last_audit_date,
    p.user_id,
    -- Added for filtering
    p.representative_id -- Added for filtering
FROM public.registro_pvp_farmacia r
    JOIN public.products pr ON r.producto_id = pr.id
    JOIN public.pharmacies p ON r.pharmacy_id = p.id
ORDER BY r.pharmacy_id,
    r.producto_id,
    r.created_at DESC;
-- Enable security invoker
ALTER VIEW public.view_farmacia_stock_actual
SET (security_invoker = true);
-- Grant access
GRANT SELECT ON public.view_farmacia_stock_actual TO authenticated;
-- Also try to ensure pharmacy_reports exists or fix if missing (mocking it if needed for demo)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'pharmacy_reports'
) THEN CREATE TABLE public.pharmacy_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id uuid REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    title text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id),
    -- Owner
    representative_id uuid -- For filtering
);
ALTER TABLE public.pharmacy_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.pharmacy_reports FOR ALL TO authenticated USING (true);
END IF;
END $$;