-- ========================================================================
-- SAFE MASTER MIGRATION - EMPRESA CA
-- Version: 20260525143000_universal_routing_safe
-- Scope: Soporte de Ruteo Universal en Red de Contactos y Restauración
-- ========================================================================

-- 1. ASEGURAR QUE LAS TABLAS EXISTEN (Por si migraciones anteriores fallaron)
CREATE TABLE IF NOT EXISTS commerces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID,
    name TEXT NOT NULL,
    rif TEXT,
    owner_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    email TEXT,
    contact_type TEXT DEFAULT 'commerce',
    priority TEXT DEFAULT 'medium',
    potential TEXT DEFAULT 'Medio',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'Activo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS natural_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID,
    name TEXT NOT NULL,
    rif TEXT,
    owner_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    email TEXT,
    contact_type TEXT DEFAULT 'natural_store',
    priority TEXT DEFAULT 'medium',
    potential TEXT DEFAULT 'Medio',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'Activo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADICIÓN DE COLUMNA 'routing_days' A ENTIDADES SIN RUTEO
DO $$ 
BEGIN
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS routing_days TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS routing_days TEXT;
    ALTER TABLE commerces ADD COLUMN IF NOT EXISTS routing_days TEXT;
    ALTER TABLE natural_stores ADD COLUMN IF NOT EXISTS routing_days TEXT;
END $$;

-- 3. RECONSTRUCCIÓN DE LA VISTA UNIFICADA CON SOPORTE DE RUTEO
DROP VIEW IF EXISTS unified_contacts;

CREATE OR REPLACE VIEW unified_contacts AS
SELECT 
    id, name, 'doctor' as contact_type, address, city, state, phone, 
    specialty, priority, potential, organization_id, user_id, created_at,
    'doctors' as source,
    days as routing_days
FROM doctors
UNION ALL
SELECT 
    id, name, 'pharmacy' as contact_type, address, city, state, phone, 
    'Farmacia' as specialty, priority, potential, organization_id, user_id, created_at,
    'pharmacies' as source,
    schedule as routing_days
FROM pharmacies
UNION ALL
SELECT 
    id, name, facility_type as contact_type, address, city, state, phone, 
    facility_type as specialty, priority, potential, organization_id, user_id, created_at,
    'health_centers' as source,
    routing_days
FROM health_centers
UNION ALL
SELECT 
    id, name, 'drugstore' as contact_type, address, city, state, phone, 
    'Droguería' as specialty, priority, potential, organization_id, user_id, created_at,
    'drugstores' as source,
    routing_days
FROM drugstores
UNION ALL
SELECT 
    id, name, 'commerce' as contact_type, address, city, state, phone, 
    'Comercio' as specialty, priority, potential, organization_id, user_id, created_at,
    'commerces' as source,
    routing_days
FROM commerces
UNION ALL
SELECT 
    id, name, 'natural_store' as contact_type, address, city, state, phone, 
    'Tienda Naturista' as specialty, priority, potential, organization_id, user_id, created_at,
    'natural_stores' as source,
    routing_days
FROM natural_stores;

-- 4. SEGURIDAD Y METADATOS
ALTER VIEW public.unified_contacts SET (security_invoker = true);
COMMENT ON VIEW unified_contacts IS 'Vista unificada de todos los canales de contacto con soporte universal de rutas (routing_days).';
