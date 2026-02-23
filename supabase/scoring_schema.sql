-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ==============================================
-- MediVisitPro - Doctor Scores Schema
-- Fase 1: Sistema de Scoring de Médicos
-- ==============================================

-- Tabla para almacenar scores calculados de médicos
CREATE TABLE IF NOT EXISTS doctor_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE UNIQUE,
  
  -- Métricas base
  total_visits INTEGER DEFAULT 0,
  visits_last_30_days INTEGER DEFAULT 0,
  visits_last_90_days INTEGER DEFAULT 0,
  
  -- Engagement
  samples_received INTEGER DEFAULT 0,
  products_presented INTEGER DEFAULT 0,
  avg_visit_duration_minutes NUMERIC(5,2) DEFAULT 0,
  
  -- Score calculado (0-100)
  score_value NUMERIC(5,2) DEFAULT 0,
  score_category VARCHAR(20) DEFAULT 'low', -- low, medium, high, vip
  
  -- Frecuencia ideal vs actual
  ideal_visit_frequency_days INTEGER DEFAULT 30,
  days_since_last_visit INTEGER DEFAULT 0,
  visit_gap_status VARCHAR(20) DEFAULT 'on_track', -- on_track, overdue, critical
  
  last_visit_date TIMESTAMP WITH TIME ZONE,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_doctor_scores_score ON doctor_scores(score_value DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_scores_category ON doctor_scores(score_category);
CREATE INDEX IF NOT EXISTS idx_doctor_scores_gap ON doctor_scores(visit_gap_status);

-- ==============================================
-- Tabla de distribución de muestras (Fase 2)
-- ==============================================

CREATE TABLE IF NOT EXISTS sample_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  sample_inventory_id UUID REFERENCES sample_inventory(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  distributed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sample_dist_visit ON sample_distributions(visit_id);
CREATE INDEX IF NOT EXISTS idx_sample_dist_contact ON sample_distributions(contact_id);

-- ==============================================
-- RLS Policies
-- ==============================================

ALTER TABLE doctor_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_distributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view doctor scores" ON doctor_scores;
DROP POLICY IF EXISTS "Users can insert doctor scores" ON doctor_scores;
DROP POLICY IF EXISTS "Users can update doctor scores" ON doctor_scores;
DROP POLICY IF EXISTS "Users can view sample distributions" ON sample_distributions;
DROP POLICY IF EXISTS "Users can insert sample distributions" ON sample_distributions;

-- Doctor scores - visible para usuarios autenticados
CREATE POLICY "Users can view doctor scores" ON doctor_scores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert doctor scores" ON doctor_scores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update doctor scores" ON doctor_scores
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Sample distributions - visible para usuarios autenticados
CREATE POLICY "Users can view sample distributions" ON sample_distributions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sample distributions" ON sample_distributions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
