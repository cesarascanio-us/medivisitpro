-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- SCRIPT DE AUDITORÍA DE DATOS MAESTROS
-- Copiar y pegar en el Editor SQL de Supabase para ver el diagnóstico total
-- Verifica qué datos existen y si están visibles para la organización Demo.
DO $$
DECLARE doctors_total INT;
doctors_orphans INT;
pharmacies_total INT;
health_centers_total INT;
natural_stores_total INT;
drugstores_total INT;
BEGIN RAISE NOTICE '=========================================';
RAISE NOTICE '   REPORTE DE AUDITORÍA DE DATOS   ';
RAISE NOTICE '=========================================';
-- 1. AUDITORÍA DE MÉDICOS (Tabla: doctors)
SELECT COUNT(*) INTO doctors_total
FROM doctors;
SELECT COUNT(*) INTO doctors_orphans
FROM doctors
WHERE organization_id IS NULL;
RAISE NOTICE 'MÉDICOS (Tabla dedicated: doctors):';
RAISE NOTICE '  - Total en Base de Datos: %',
doctors_total;
RAISE NOTICE '  - Huérfanos (Sin Org ID): %',
doctors_orphans;
IF doctors_orphans > 0 THEN RAISE NOTICE '  -> ERROR CRÍTICO: % médicos no se verán en la App.',
doctors_orphans;
ELSE RAISE NOTICE '  -> OK: Todos los médicos tienen organización.';
END IF;
RAISE NOTICE '-----------------------------------------';
-- 2. AUDITORÍA DE FARMACIAS (Tabla: pharmacies)
SELECT COUNT(*) INTO pharmacies_total
FROM pharmacies;
RAISE NOTICE 'FARMACIAS (Tabla dedicated: pharmacies):';
RAISE NOTICE '  - Total en Base de Datos: %',
pharmacies_total;
RAISE NOTICE '-----------------------------------------';
-- 3. AUDITORÍA DE CENTROS DE SALUD (Tabla: health_centers)
SELECT COUNT(*) INTO health_centers_total
FROM health_centers;
RAISE NOTICE 'CENTROS DE SALUD (Tabla: health_centers):';
RAISE NOTICE '  - Total en Base de Datos: %',
health_centers_total;
RAISE NOTICE '-----------------------------------------';
-- 4. AUDITORÍA DE OTROS CONTACTOS (Tabla: contacts)
-- Aquí viven Tiendas Naturistas y Droguerías
SELECT COUNT(*) INTO natural_stores_total
FROM contacts
WHERE contact_type = 'natural_store';
SELECT COUNT(*) INTO drugstores_total
FROM contacts
WHERE contact_type = 'drugstore';
RAISE NOTICE 'CONTACTOS GENÉRICOS (Tabla: contacts):';
RAISE NOTICE '  - Tiendas Naturistas: %',
natural_stores_total;
RAISE NOTICE '  - Droguerías: %',
drugstores_total;
RAISE NOTICE '-----------------------------------------';
END $$;
-- 5. VISTA DETALLADA DE ORG IDs (Para depuración visual en resultados del query)
SELECT 'Doctors' as table_name,
    count(*) as count,
    organization_id
FROM doctors
GROUP BY organization_id
UNION ALL
SELECT 'Pharmacies',
    count(*),
    organization_id
FROM pharmacies
GROUP BY organization_id
UNION ALL
SELECT 'Contacts (Naturista/Drogue)',
    count(*),
    organization_id
FROM contacts
GROUP BY organization_id;