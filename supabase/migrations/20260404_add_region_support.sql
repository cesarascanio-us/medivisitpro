-- ========================================================================
-- MASTER MIGRATION - EMPRESA CA
-- Version: 20260404_add_region_support (INDUSTRIAL V6 - GLOBAL TERRITORY)
-- Scope: Soporte de Regionalización en Red de Contactos
-- ========================================================================

-- 1. ADICIÓN DE COLUMNA 'region' A TODAS LAS ENTIDADES DE CONTACTO
DO $$ 
BEGIN
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE commerces ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE natural_stores ADD COLUMN IF NOT EXISTS region TEXT;
END $$;

-- 2. RECONSTRUCCIÓN DE LA VISTA UNIFICADA CON SOPORTE DE REGIÓN
DROP VIEW IF EXISTS unified_contacts;

CREATE OR REPLACE VIEW unified_contacts AS
SELECT 
    id, name, 'doctor' as contact_type, address, city, state, region, phone, 
    specialty, priority, potential, organization_id, user_id, created_at,
    'doctors' as source
FROM doctors
UNION ALL
SELECT 
    id, name, 'pharmacy' as contact_type, address, city, state, region, phone, 
    'Farmacia' as specialty, priority, potential, organization_id, user_id, created_at,
    'pharmacies' as source
FROM pharmacies
UNION ALL
SELECT 
    id, name, facility_type as contact_type, address, city, state, region, phone, 
    facility_type as specialty, priority, potential, organization_id, user_id, created_at,
    'health_centers' as source
FROM health_centers
UNION ALL
SELECT 
    id, name, 'drugstore' as contact_type, address, city, state, region, phone, 
    'Droguería' as specialty, priority, potential, organization_id, user_id, created_at,
    'drugstores' as source
FROM drugstores
UNION ALL
SELECT 
    id, name, 'commerce' as contact_type, address, city, state, region, phone, 
    'Comercio' as specialty, priority, potential, organization_id, user_id, created_at,
    'commerces' as source
FROM commerces
UNION ALL
SELECT 
    id, name, 'natural_store' as contact_type, address, city, state, region, phone, 
    'Tienda Naturista' as specialty, priority, potential, organization_id, user_id, created_at,
    'natural_stores' as source
FROM natural_stores;

-- 3. COMENTARIO DE VERIFICACIÓN
COMMENT ON VIEW unified_contacts IS 'Vista unificada de todos los canales de contacto con soporte para filtrado por región y territorio industrial.';
