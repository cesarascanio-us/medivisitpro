-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================


-- Migration: Restore Missing Zones Tables and Views
-- Date: 2026-01-02
-- Objective: Fix 404 errors by creating missing 'zones' table and 'view_kpi_zonas'.

-- 1. Create 'zones' table if not exists
CREATE TABLE IF NOT EXISTS public.zones (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    state text, -- State this zone belongs to (e.g., 'Carabobo')
    region text, -- Region mapping (e.g., 'Central')
    created_at timestamptz DEFAULT now()
);

-- 2. Insert Default Data (to avoid empty lists)
INSERT INTO public.zones (name, state, region)
VALUES 
('Zona Norte Valencia', 'Carabobo', 'Central'),
('Zona Sur Valencia', 'Carabobo', 'Central'),
('Zona Este Caracas', 'Distrito Capital', 'Capital'),
('Zona Oeste Maracay', 'Aragua', 'Central'),
('Zona Industrial', 'Carabobo', 'Central')
ON CONFLICT DO NOTHING;

-- 3. Enable RLS on zones
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policy for zones
DROP POLICY IF EXISTS "Enable read access for all users" ON public.zones;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.zones;

CREATE POLICY "Enable read access for all authenticated users"
ON public.zones
FOR SELECT
TO authenticated
USING (true);

-- 5. Create 'view_kpi_zonas'
-- DROP FIRST to avoid "cannot change name of view column" error if exists with different schema
DROP VIEW IF EXISTS public.view_kpi_zonas;

CREATE VIEW public.view_kpi_zonas AS
SELECT 
    z.id as zone_id,
    z.name as zone_name,
    COUNT(DISTINCT ur.user_id) as active_reps,
    -- Placeholders for sales data since orders might not link directly to zones easily yet
    0::numeric as total_amount,
    0::numeric as total_orders
FROM public.zones z
LEFT JOIN public.user_roles ur ON z.state = ur.state -- Weak link by state for approximation
GROUP BY z.id, z.name;

-- Grant permissions
GRANT SELECT ON public.zones TO authenticated, anon;
GRANT SELECT ON public.view_kpi_zonas TO authenticated, anon;

DO $$
BEGIN
    RAISE NOTICE 'Restored zones table and view_kpi_zonas successfully.';
END $$;
