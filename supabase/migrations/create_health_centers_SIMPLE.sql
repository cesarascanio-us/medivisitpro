-- Migration: Create health_centers table (SIMPLE VERSION - NO CONSTRAINTS)
-- Date: 2025-12-22
-- This script DROPS the existing table and creates it fresh

-- Drop existing table if it exists (CAUTION: This deletes all data)
DROP TABLE IF EXISTS health_centers CASCADE;

-- Create health_centers table
CREATE TABLE health_centers (
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

-- Create indexes
CREATE INDEX idx_health_centers_user_id ON health_centers(user_id);
CREATE INDEX idx_health_centers_name ON health_centers(name);
CREATE INDEX idx_health_centers_facility_type ON health_centers(facility_type);
CREATE INDEX idx_health_centers_city ON health_centers(city);
CREATE INDEX idx_health_centers_zone_id ON health_centers(zone_id);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_health_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_health_centers_updated_at
    BEFORE UPDATE ON health_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_health_centers_updated_at();

-- Enable RLS
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;

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
