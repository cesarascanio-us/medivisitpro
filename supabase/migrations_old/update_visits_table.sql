-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Expand visits table with comprehensive fields
-- Date: 2025-12-22
-- Purpose: Add 30+ fields for detailed visit tracking (doctors and pharmacies)

-- Add time fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS arrival_time TIME;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS departure_time TIME;

-- Add visit type and references
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_type TEXT; -- 'doctor' | 'pharmacy'
ALTER TABLE visits ADD COLUMN IF NOT EXISTS pharmacy_id UUID REFERENCES pharmacies(id);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS representative TEXT;

-- Pre-Visit fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS cycle_condition TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_objective TEXT;

-- During Visit fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS products_presented TEXT[];
ALTER TABLE visits ADD COLUMN IF NOT EXISTS samples_delivered TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS promotional_materials TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS doctor_interest TEXT; -- Alto, Medio, Bajo
ALTER TABLE visits ADD COLUMN IF NOT EXISTS activity_performed TEXT;

-- Post-Visit fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS products_prescribed TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS results_notes TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS pending_followup TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS next_visit_date DATE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS observations_feedback TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS key_contact BOOLEAN DEFAULT false;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS next_step TEXT;

-- Status (rename existing 'status' to 'visit_status' if needed, or use existing)
-- Assuming 'status' column already exists, we'll use it
-- ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_status TEXT;

-- Competence
ALTER TABLE visits ADD COLUMN IF NOT EXISTS competitor_activity TEXT;

-- Pharmacy Specific
ALTER TABLE visits ADD COLUMN IF NOT EXISTS shelf_photo_url TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS purchase_driver TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS detected_purchase_reason TEXT;

-- Closure fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS closure_reason TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS contact_reaction TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS main_objection TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS closure_commitment TEXT;

-- Media & Location
ALTER TABLE visits ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS geolocation TEXT;

-- Create index for pharmacy_id
CREATE INDEX IF NOT EXISTS idx_visits_pharmacy_id ON visits(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_type ON visits(visit_type);
CREATE INDEX IF NOT EXISTS idx_visits_next_visit_date ON visits(next_visit_date);

-- Comments
COMMENT ON COLUMN visits.visit_type IS 'Type of visit: doctor or pharmacy';
COMMENT ON COLUMN visits.arrival_time IS 'Time of arrival at location';
COMMENT ON COLUMN visits.departure_time IS 'Time of departure from location';
COMMENT ON COLUMN visits.products_presented IS 'Array of products presented during visit';
COMMENT ON COLUMN visits.doctor_interest IS 'Level of doctor interest: Alto, Medio, Bajo';
COMMENT ON COLUMN visits.key_contact IS 'Whether this contact is considered key';
COMMENT ON COLUMN visits.shelf_photo_url IS 'Photo of pharmacy shelf (pharmacy visits only)';
COMMENT ON COLUMN visits.geolocation IS 'GPS coordinates of visit location';
