-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Create doctor_schedules table
-- Date: 2025-12-22
-- Purpose: Track multiple locations and schedules for each doctor

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL,
    
    -- Location details (if not using health_center)
    direccion TEXT,
    zona_sector TEXT,
    ciudad TEXT,
    estado TEXT,
    
    -- Schedule details
    dias_atencion TEXT NOT NULL, -- ej: "Lunes a Viernes", "Martes y Jueves"
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    
    -- Status
    activo BOOLEAN DEFAULT true,
    notas TEXT,
    
    -- Metadata
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_health_center ON doctor_schedules(health_center_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_user ON doctor_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_activo ON doctor_schedules(activo);

-- Updated_at trigger
CREATE TRIGGER trigger_doctor_schedules_updated_at
    BEFORE UPDATE ON doctor_schedules
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

-- Enable RLS
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own doctor_schedules"
    ON doctor_schedules FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE doctor_schedules IS 'Multiple locations and schedules for each doctor';
COMMENT ON COLUMN doctor_schedules.doctor_id IS 'Reference to doctor (contacts table)';
COMMENT ON COLUMN doctor_schedules.health_center_id IS 'Optional reference to health center';
COMMENT ON COLUMN doctor_schedules.dias_atencion IS 'Days of attention (e.g., "Lunes a Viernes")';
COMMENT ON COLUMN doctor_schedules.hora_inicio IS 'Start time of consultation';
COMMENT ON COLUMN doctor_schedules.hora_fin IS 'End time of consultation';
