-- =============================================
-- Migration: Restructure Zones to be State Subdivisions
-- =============================================
-- This migration adds a 'state' column to the zones table
-- and updates the zones to be actual subdivisions within states
-- instead of being synonyms for regions.

-- Step 1: Add 'state' column to zones table
ALTER TABLE public.zones ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.zones ADD COLUMN IF NOT EXISTS region TEXT;

-- Step 2: Clear existing zones (which are incorrectly named as regions)
-- and insert new zones that are actual subdivisions within states
TRUNCATE TABLE public.zones CASCADE;

-- Step 3: Insert new zones for each state
-- Region Central
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Aragua Norte', 'Aragua', 'Central', NOW()),
  (gen_random_uuid(), 'Aragua Sur', 'Aragua', 'Central', NOW()),
  (gen_random_uuid(), 'Aragua Centro', 'Aragua', 'Central', NOW()),
  (gen_random_uuid(), 'Carabobo Norte', 'Carabobo', 'Central', NOW()),
  (gen_random_uuid(), 'Carabobo Sur', 'Carabobo', 'Central', NOW()),
  (gen_random_uuid(), 'Carabobo Centro', 'Carabobo', 'Central', NOW()),
  (gen_random_uuid(), 'Cojedes Este', 'Cojedes', 'Central', NOW()),
  (gen_random_uuid(), 'Cojedes Oeste', 'Cojedes', 'Central', NOW()),
  (gen_random_uuid(), 'Yaracuy Este', 'Yaracuy', 'Central', NOW()),
  (gen_random_uuid(), 'Yaracuy Oeste', 'Yaracuy', 'Central', NOW());

-- Region Capital
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Distrito Capital Centro', 'Distrito Capital', 'Capital', NOW()),
  (gen_random_uuid(), 'Distrito Capital Norte', 'Distrito Capital', 'Capital', NOW()),
  (gen_random_uuid(), 'Distrito Capital Sur', 'Distrito Capital', 'Capital', NOW()),
  (gen_random_uuid(), 'La Guaira Este', 'Vargas', 'Capital', NOW()),
  (gen_random_uuid(), 'La Guaira Oeste', 'Vargas', 'Capital', NOW()),
  (gen_random_uuid(), 'Miranda Norte', 'Miranda', 'Capital', NOW()),
  (gen_random_uuid(), 'Miranda Sur', 'Miranda', 'Capital', NOW()),
  (gen_random_uuid(), 'Miranda Este', 'Miranda', 'Capital', NOW()),
  (gen_random_uuid(), 'Miranda Oeste', 'Miranda', 'Capital', NOW());

-- Region Occidente
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Zulia Norte', 'Zulia', 'Occidente', NOW()),
  (gen_random_uuid(), 'Zulia Sur', 'Zulia', 'Occidente', NOW()),
  (gen_random_uuid(), 'Zulia Centro', 'Zulia', 'Occidente', NOW()),
  (gen_random_uuid(), 'Lara Norte', 'Lara', 'Occidente', NOW()),
  (gen_random_uuid(), 'Lara Sur', 'Lara', 'Occidente', NOW()),
  (gen_random_uuid(), 'Falcón Este', 'Falcón', 'Occidente', NOW()),
  (gen_random_uuid(), 'Falcón Oeste', 'Falcón', 'Occidente', NOW()),
  (gen_random_uuid(), 'Trujillo Este', 'Trujillo', 'Occidente', NOW()),
  (gen_random_uuid(), 'Trujillo Oeste', 'Trujillo', 'Occidente', NOW());

-- Region Andes
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Mérida Norte', 'Mérida', 'Andes', NOW()),
  (gen_random_uuid(), 'Mérida Sur', 'Mérida', 'Andes', NOW()),
  (gen_random_uuid(), 'Táchira Norte', 'Táchira', 'Andes', NOW()),
  (gen_random_uuid(), 'Táchira Sur', 'Táchira', 'Andes', NOW()),
  (gen_random_uuid(), 'Barinas Este', 'Barinas', 'Andes', NOW()),
  (gen_random_uuid(), 'Barinas Oeste', 'Barinas', 'Andes', NOW());

-- Region Oriente
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Anzoátegui Norte', 'Anzoátegui', 'Oriente', NOW()),
  (gen_random_uuid(), 'Anzoátegui Sur', 'Anzoátegui', 'Oriente', NOW()),
  (gen_random_uuid(), 'Sucre Este', 'Sucre', 'Oriente', NOW()),
  (gen_random_uuid(), 'Sucre Oeste', 'Sucre', 'Oriente', NOW()),
  (gen_random_uuid(), 'Monagas Norte', 'Monagas', 'Oriente', NOW()),
  (gen_random_uuid(), 'Monagas Sur', 'Monagas', 'Oriente', NOW()),
  (gen_random_uuid(), 'Nueva Esparta Centro', 'Nueva Esparta', 'Oriente', NOW());

-- Region Guayana
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Bolívar Norte', 'Bolívar', 'Guayana', NOW()),
  (gen_random_uuid(), 'Bolívar Sur', 'Bolívar', 'Guayana', NOW()),
  (gen_random_uuid(), 'Amazonas Centro', 'Amazonas', 'Guayana', NOW()),
  (gen_random_uuid(), 'Delta Amacuro Centro', 'Delta Amacuro', 'Guayana', NOW());

-- Region Llanos
INSERT INTO public.zones (id, name, state, region, created_at) VALUES
  (gen_random_uuid(), 'Guárico Norte', 'Guárico', 'Llanos', NOW()),
  (gen_random_uuid(), 'Guárico Sur', 'Guárico', 'Llanos', NOW()),
  (gen_random_uuid(), 'Apure Este', 'Apure', 'Llanos', NOW()),
  (gen_random_uuid(), 'Apure Oeste', 'Apure', 'Llanos', NOW()),
  (gen_random_uuid(), 'Portuguesa Norte', 'Portuguesa', 'Llanos', NOW()),
  (gen_random_uuid(), 'Portuguesa Sur', 'Portuguesa', 'Llanos', NOW());

-- Step 4: Update user_roles to set zone_id to null where the zone no longer exists
-- (This avoids foreign key issues)
UPDATE public.user_roles SET zone_id = NULL WHERE zone_id IS NOT NULL;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload config';
