-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Create health_centers table (ALTERNATIVE VERSION)
-- Date: 2025-12-22

-- Drop table if exists (use with caution)
-- DROP TABLE IF EXISTS health_centers CASCADE;

-- Create health_centers table WITHOUT constraints first
CREATE TABLE IF NOT EXISTS health_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zone_id TEXT,
    phone TEXT,
    potential TEXT,
    last_visit DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints AFTER table creation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'facility_type_check'
    ) THEN
        ALTER TABLE health_centers 
            ADD CONSTRAINT facility_type_check 
            CHECK (facility_type IN ('Hospital', 'Clínica', 'Consultorio', 'Ambulatorio', 'Centro Médico', 'Otro'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'potential_check'
    ) THEN
        ALTER TABLE health_centers 
            ADD CONSTRAINT potential_check 
            CHECK (potential IN ('Alto', 'Medio', 'Bajo') OR potential IS NULL);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_centers_user_id ON health_centers(user_id);
CREATE INDEX IF NOT EXISTS idx_health_centers_name ON health_centers(name);
CREATE INDEX IF NOT EXISTS idx_health_centers_facility_type ON health_centers(facility_type);
CREATE INDEX IF NOT EXISTS idx_health_centers_city ON health_centers(city);
CREATE INDEX IF NOT EXISTS idx_health_centers_zone_id ON health_centers(zone_id);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_health_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_health_centers_updated_at ON health_centers;
CREATE TRIGGER trigger_health_centers_updated_at
    BEFORE UPDATE ON health_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_health_centers_updated_at();

-- Enable RLS
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own health centers" ON health_centers;
DROP POLICY IF EXISTS "Users can insert own health centers" ON health_centers;
DROP POLICY IF EXISTS "Users can update own health centers" ON health_centers;
DROP POLICY IF EXISTS "Users can delete own health centers" ON health_centers;

-- Create RLS Policies
CREATE POLICY "Users can view own health centers"
    ON health_centers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health centers"
    ON health_centers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health centers"
    ON health_centers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health centers"
    ON health_centers FOR DELETE
    USING (auth.uid() = user_id);
