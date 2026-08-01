-- ========================================================================
-- MASTER MIGRATION - EMPRESA CA
-- Version: 20260404_fix_geo_and_unified_view (INDUSTRIAL V5 - INTEGRITY BLINDAGE)
-- Scope: Industrialización Multicanal & Soberanía de Datos
-- ========================================================================

-- 1. SANEAMIENTO PREVIO DE TABLA LEGACY 'contacts'
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
    ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS potential TEXT DEFAULT 'Medio';
    ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS address TEXT;
END $$;

-- 2. SANEAMIENTO DE TABLAS EXISTENTES (Blindaje estructural para UNION ALL)
DO $$ 
BEGIN
    -- DOCTORS
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS potential TEXT DEFAULT 'Medio';
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    
    -- PHARMACIES
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS potential TEXT DEFAULT 'Medio';
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
    ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    
    -- HEALTH CENTERS
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS potential TEXT DEFAULT 'Medio';
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
    ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    
    -- DRUGSTORES
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS potential TEXT DEFAULT 'Medio';
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS rif TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS owner_name TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS sanitary_permits BOOLEAN DEFAULT FALSE;
END $$;

-- 3. CREACIÓN DE NUEVAS ENTIDADES INDUSTRIALES (Comercios, Tiendas Naturistas)
CREATE TABLE IF NOT EXISTS commerces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users(id),
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
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users(id),
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

-- 4. MIGRACIÓN TÁCTICA CON BLINDAJE DE TIPOS
INSERT INTO commerces (id, organization_id, user_id, name, rif, owner_name, address, city, state, phone, email, contact_type, priority, potential, status, created_at)
SELECT id, organization_id, user_id, name, rif, owner_name, address, city, state, phone, email, 'commerce', priority, potential, 'Activo', created_at
FROM contacts
WHERE contact_type::text = 'commerce'
ON CONFLICT (id) DO NOTHING;

INSERT INTO natural_stores (id, organization_id, user_id, name, rif, owner_name, address, city, state, phone, email, contact_type, priority, potential, status, created_at)
SELECT id, organization_id, user_id, name, rif, owner_name, address, city, state, phone, email, 'natural_store', priority, potential, 'Activo', created_at
FROM contacts
WHERE contact_type::text = 'natural_store'
ON CONFLICT (id) DO NOTHING;

DELETE FROM contacts WHERE contact_type::text IN ('commerce', 'natural_store', 'drugstore');

-- 5. RECONSTRUCCIÓN DE LA VISTA UNIFICADA (Motor de 6 Canales)
DROP VIEW IF EXISTS unified_contacts;

CREATE OR REPLACE VIEW unified_contacts AS
SELECT 
    id, name, 'doctor' as contact_type, address, city, state, phone, 
    specialty, priority, potential, organization_id, user_id, created_at,
    'doctors' as source
FROM doctors
UNION ALL
SELECT 
    id, name, 'pharmacy' as contact_type, address, city, state, phone, 
    'Farmacia' as specialty, priority, potential, organization_id, user_id, created_at,
    'pharmacies' as source
FROM pharmacies
UNION ALL
SELECT 
    id, name, facility_type as contact_type, address, city, state, phone, 
    facility_type as specialty, priority, potential, organization_id, user_id, created_at,
    'health_centers' as source
FROM health_centers
UNION ALL
SELECT 
    id, name, 'drugstore' as contact_type, address, city, state, phone, 
    'Droguería' as specialty, priority, potential, organization_id, user_id, created_at,
    'drugstores' as source
FROM drugstores
UNION ALL
SELECT 
    id, name, 'commerce' as contact_type, address, city, state, phone, 
    'Comercio' as specialty, priority, potential, organization_id, user_id, created_at,
    'commerces' as source
FROM commerces
UNION ALL
SELECT 
    id, name, 'natural_store' as contact_type, address, city, state, phone, 
    'Tienda Naturista' as specialty, priority, potential, organization_id, user_id, created_at,
    'natural_stores' as source
FROM natural_stores;

-- 6. SEGURIDAD RLS
ALTER TABLE commerces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization commerces" ON commerces
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE organization_id = commerces.organization_id));
