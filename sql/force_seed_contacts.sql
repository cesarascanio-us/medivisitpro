-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- MediVisitPro - Deep Diagnostic & Force Seed
-- =============================================

-- 1. CHECK ROW COUNTS
SELECT 'Total Contacts' as info, count(*)::text as value FROM public.contacts
UNION ALL
SELECT 'Total Doctors' as info, count(*)::text FROM public.doctors -- check if doctors exist but aren't in contacts
UNION ALL
SELECT 'Total Zones' as info, count(*)::text FROM public.zones;

-- 2. IF EMPTY, INSERT SAMPLE CONTACTS
-- This will ensure there is something to see. 
-- We'll link them to the first zone and company found.
INSERT INTO public.contacts (id, name, contact_type, latitude, longitude, zone_id, company_id, user_id)
SELECT 
    gen_random_uuid(), 
    'Dr. Prueba ' || i, 
    'doctor', 
    10.4806 + (random() * 0.1 - 0.05), 
    -66.9036 + (random() * 0.1 - 0.05),
    (SELECT id FROM public.zones LIMIT 1),
    (SELECT id FROM public.companies LIMIT 1),
    auth.uid()
FROM generate_series(1, 5) AS i
WHERE NOT EXISTS (SELECT 1 FROM public.contacts LIMIT 1); -- Only if empty

-- 3. FINAL CHECK
SELECT 'Contacts with Coords (Final)' as info, count(*)::text as value FROM public.contacts WHERE latitude IS NOT NULL;
