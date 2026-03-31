-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Phase 2 - Visit Execution & Neuro-Sales
-- Date: 2024-12-23
-- Purpose: Modernize visits table for execution, check-in, and neuro-sales tracking.

-- =====================================================
-- 1. Modify Visits Table
-- =====================================================

-- Add Directory Item Link (Unified Directory)
ALTER TABLE visits ADD COLUMN IF NOT EXISTS directory_item_id UUID REFERENCES directory_items(id);

-- Check-in / Check-out & Location
ALTER TABLE visits ADD COLUMN IF NOT EXISTS checkin_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS checkout_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS location_lat NUMERIC;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS location_lng NUMERIC;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS distance_meters NUMERIC; -- Distance from target at check-in

-- Neuro-Sales & Outcome Fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS emotional_state TEXT; -- 'open', 'skeptical', 'indifferent', 'closed'
ALTER TABLE visits ADD COLUMN IF NOT EXISTS purchase_driver TEXT; -- 'price', 'quality', 'relationship', 'availability'
ALTER TABLE visits ADD COLUMN IF NOT EXISTS next_commitment TEXT; -- Specific next step agreed upon
ALTER TABLE visits ADD COLUMN IF NOT EXISTS photo_url TEXT; -- For shelf photos or proof of visit

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_visits_directory_item ON visits(directory_item_id);
CREATE INDEX IF NOT EXISTS idx_visits_checkin ON visits(checkin_at);

-- =====================================================
-- 2. RLS Policies for Visits (Refined)
-- =====================================================
-- Ensure we have the logic from the previous optimization
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visits Access Policy" ON visits;
CREATE POLICY "Visits Access Policy" ON visits
FOR ALL USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() IN ('supervisor', 'telemarketing') AND zone_id = get_my_zone_id()) OR
    (get_my_role() = 'representative' AND user_id = auth.uid()) -- Reps manage their own
);

-- =====================================================
-- 3. Utility Function: Calculate Distance
-- =====================================================
-- (Optional) If we want server-side validation later. 
-- For now, we trust the client's calculated numeric distance, or raw lat/lng.
