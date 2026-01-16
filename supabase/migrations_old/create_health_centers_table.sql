-- Migration: Create health_centers table
-- Date: 2025-12-22
-- Purpose: Replace hospitals functionality with comprehensive health centers management

-- Create health_centers table
CREATE TABLE IF NOT EXISTS health_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    
    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    zone_id TEXT,
    
    -- Contact & Tracking
    phone TEXT,
    potential TEXT,
    last_visit DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT facility_type_check CHECK (facility_type IN ('Hospital', 'Clínica', 'Consultorio', 'Ambulatorio', 'Centro Médico', 'Otro')),
    CONSTRAINT potential_check CHECK (potential IN ('Alto', 'Medio', 'Bajo') OR potential IS NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_centers_user_id ON health_centers(user_id);
CREATE INDEX IF NOT EXISTS idx_health_centers_name ON health_centers(name);
CREATE INDEX IF NOT EXISTS idx_health_centers_facility_type ON health_centers(facility_type);
CREATE INDEX IF NOT EXISTS idx_health_centers_city ON health_centers(city);
CREATE INDEX IF NOT EXISTS idx_health_centers_zone_id ON health_centers(zone_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_health_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_health_centers_updated_at
    BEFORE UPDATE ON health_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_health_centers_updated_at();

-- Enable Row Level Security
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view their own health centers
CREATE POLICY "Users can view own health centers"
    ON health_centers FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own health centers
CREATE POLICY "Users can insert own health centers"
    ON health_centers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own health centers
CREATE POLICY "Users can update own health centers"
    ON health_centers FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own health centers
CREATE POLICY "Users can delete own health centers"
    ON health_centers FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE health_centers IS 'Health facilities including hospitals, clinics, medical offices, and ambulatory centers';
COMMENT ON COLUMN health_centers.name IS 'Name of the health center';
COMMENT ON COLUMN health_centers.facility_type IS 'Type of facility: Hospital, Clínica, Consultorio, Ambulatorio, etc.';
COMMENT ON COLUMN health_centers.address IS 'Full address';
COMMENT ON COLUMN health_centers.city IS 'City';
COMMENT ON COLUMN health_centers.state IS 'State or region';
COMMENT ON COLUMN health_centers.zone_id IS 'Zone identifier for territory management';
COMMENT ON COLUMN health_centers.phone IS 'Main phone number';
COMMENT ON COLUMN health_centers.potential IS 'Business potential: Alto, Medio, Bajo';
COMMENT ON COLUMN health_centers.last_visit IS 'Date of last visit';
