-- Migration: Update view_geo_map for unified geospatial visualization with permissions
-- Date: 2026-01-31
-- 1. Drop existing view if it exists
DROP VIEW IF EXISTS public.view_geo_map;
-- 2. Vista Geoespacial Unificada con SECURITY INVOKER
CREATE OR REPLACE VIEW public.view_geo_map WITH (security_invoker = true) AS
SELECT id::uuid as id,
    'doctor'::text as type,
    name::text as name,
    city::text as city,
    lat::double precision as lat,
    lng::double precision as lng,
    representative_id::uuid as assigned_rep_id,
    zone_id::uuid as zone_id,
    -- Now referencing the real column
    state::text as state,
    NULL::text as region,
    COALESCE(specialty, '')::text as detail,
    COALESCE(address, '')::text as address,
    COALESCE(potential, '')::text as priority
FROM doctors
WHERE lat IS NOT NULL
    AND lng IS NOT NULL
UNION ALL
SELECT id::uuid as id,
    'pharmacy'::text as type,
    name::text as name,
    city::text as city,
    lat::double precision as lat,
    lng::double precision as lng,
    representative_id::uuid as assigned_rep_id,
    zone_id::uuid as zone_id,
    state::text as state,
    COALESCE(region, '')::text as region,
    COALESCE(rif, '')::text as detail,
    COALESCE(address, '')::text as address,
    COALESCE(priority, '')::text as priority
FROM pharmacies
WHERE lat IS NOT NULL
    AND lng IS NOT NULL
UNION ALL
SELECT id::uuid as id,
    'hospital'::text as type,
    name::text as name,
    city::text as city,
    lat::double precision as lat,
    lng::double precision as lng,
    NULL::uuid as assigned_rep_id,
    zone_id::uuid as zone_id,
    state::text as state,
    NULL::text as region,
    COALESCE(facility_type, '')::text as detail,
    COALESCE(address, '')::text as address,
    COALESCE(potential, '')::text as priority
FROM health_centers
WHERE lat IS NOT NULL
    AND lng IS NOT NULL;
-- 3. GRANT PERMISSIONS (Critical Fix)
GRANT SELECT ON public.view_geo_map TO authenticated;
GRANT SELECT ON public.view_geo_map TO service_role;