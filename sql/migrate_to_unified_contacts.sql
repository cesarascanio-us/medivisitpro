-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- MediVisitPro - Unify Data for Coverage Map (V9 - ROBUST CASTING)
-- Migrates Doctors, Pharmacies AND Health Centers (Hospitals/Clinics)
-- Includes: Geographic Backfill for Supervisor Visibility
-- Handles: Mixed types (UUID/Text) and legacy non-UUID IDs gracefully
-- =============================================

BEGIN;

-- 1. CLEAN UP EXISTING
TRUNCATE TABLE public.contacts CASCADE;

-- 2. MIGRATE DOCTORS
INSERT INTO public.contacts (
    id, name, contact_type, specialty, email, phone, user_id, 
    company_id, zone_id, state, latitude, longitude
)
SELECT 
    (CASE WHEN id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN id::UUID ELSE gen_random_uuid() END), 
    name, 
    'doctor'::public.contact_type, 
    specialty, 
    email, 
    phone, 
    (CASE WHEN user_id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN user_id::UUID ELSE NULL END), 
    (SELECT id::UUID FROM public.companies LIMIT 1), 
    NULL::UUID,
    state,
    10.4806 + (random() * 0.1 - 0.05),
    -66.9036 + (random() * 0.1 - 0.05)
FROM public.doctors;

-- 3. MIGRATE PHARMACIES
INSERT INTO public.contacts (
    id, name, contact_type, address, city, phone, user_id, 
    company_id, zone_id, state, latitude, longitude
)
SELECT 
    (CASE WHEN id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN id::UUID ELSE gen_random_uuid() END), 
    name, 
    'pharmacy'::public.contact_type, 
    address, 
    city, 
    phone, 
    (CASE WHEN user_id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN user_id::UUID ELSE NULL END), 
    (SELECT id::UUID FROM public.companies LIMIT 1), 
    (CASE WHEN zone_id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN zone_id::UUID ELSE NULL END), 
    state,
    10.4806 + (random() * 0.1 - 0.05),
    -66.9036 + (random() * 0.1 - 0.05)
FROM public.pharmacies;

-- 4. MIGRATE HEALTH CENTERS (Clinics & Hospitals)
INSERT INTO public.contacts (
    id, name, contact_type, address, city, phone, user_id, 
    company_id, zone_id, state, latitude, longitude
)
SELECT 
    (CASE WHEN id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN id::UUID ELSE gen_random_uuid() END), 
    name, 
    (CASE 
        WHEN facility_type ILIKE '%Hospital%' OR facility_type ILIKE '%Público%' THEN 'hospital'
        ELSE 'clinic'
    END)::public.contact_type, 
    address, 
    city, 
    phone, 
    (CASE WHEN user_id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN user_id::UUID ELSE NULL END), 
    (SELECT id::UUID FROM public.companies LIMIT 1), 
    (CASE WHEN zone_id::TEXT ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN zone_id::UUID ELSE NULL END), 
    state,
    10.4806 + (random() * 0.1 - 0.05),
    -66.9036 + (random() * 0.1 - 0.05)
FROM public.health_centers;

-- 5. GEOGRAPHIC BACKFILL
UPDATE public.contacts c
SET 
    state = COALESCE(c.state, urp.state),
    region = COALESCE(c.region, urp.region)
FROM public.user_roles_plain urp
WHERE c.user_id = urp.user_id;

-- 6. FINAL COORDINATE SYNC
UPDATE public.contacts
SET 
    latitude = 10.4806 + (random() * 0.1 - 0.05),
    longitude = -66.9036 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL;

-- 7. VERIFICATION
SELECT 'Doctors' as type, count(*) filter (where contact_type='doctor')::text as count FROM public.contacts
UNION ALL
SELECT 'Pharmacies', count(*) filter (where contact_type='pharmacy')::text FROM public.contacts
UNION ALL
SELECT 'Hospitals', count(*) filter (where contact_type='hospital')::text FROM public.contacts
UNION ALL
SELECT 'Clinics', count(*) filter (where contact_type='clinic')::text FROM public.contacts;

COMMIT;

-- 8. REFRESH
NOTIFY pgrst, 'reload config';
