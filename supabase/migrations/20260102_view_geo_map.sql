-- Migration: Create view_geo_map for unified geospatial visualization
-- Date: 2026-01-02

-- 1. Agregar Coordenadas a las Entidades
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

ALTER TABLE public.health_centers ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.health_centers ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- 2. Drop existing view if it exists (to avoid column name conflicts)
DROP VIEW IF EXISTS public.view_geo_map;

-- 3. Vista Geoespacial Unificada con SECURITY INVOKER
-- SECURITY INVOKER ensures RLS policies are checked based on the calling user, not the view owner
CREATE VIEW public.view_geo_map 
WITH (security_invoker = true)
AS
SELECT 
    id::uuid as id, 
    'doctor'::text as type, 
    name::text as name, 
    city::text as city,
    lat::double precision as lat, 
    lng::double precision as lng, 
    representative_id::uuid as assigned_rep_id, 
    NULL::uuid as zone_id,
    state::text as state,
    NULL::text as region,
    COALESCE(specialty, '')::text as detail,
    COALESCE(address, '')::text as address,
    COALESCE(potential, '')::text as priority
FROM doctors
WHERE lat IS NOT NULL AND lng IS NOT NULL
UNION ALL
SELECT 
    id::uuid as id, 
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
WHERE lat IS NOT NULL AND lng IS NOT NULL
UNION ALL
SELECT 
    id::uuid as id, 
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
WHERE lat IS NOT NULL AND lng IS NOT NULL;
