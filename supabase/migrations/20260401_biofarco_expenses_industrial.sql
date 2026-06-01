-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- MediVisitPro - Biofarco Expenses Industrialization
-- Date: 2026-04-01
-- Purpose: Add transport tracking and custom categories to expenses
-- =====================================================

DO $$ 
BEGIN
    -- 1. Add transport tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'start_km') THEN
        ALTER TABLE expenses ADD COLUMN start_km FLOAT8;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'end_km') THEN
        ALTER TABLE expenses ADD COLUMN end_km FLOAT8;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'km_start_url') THEN
        ALTER TABLE expenses ADD COLUMN km_start_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'km_end_url') THEN
        ALTER TABLE expenses ADD COLUMN km_end_url TEXT;
    END IF;

    -- 2. Add custom category support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'custom_category') THEN
        ALTER TABLE expenses ADD COLUMN custom_category TEXT;
    END IF;

    -- 3. Ensure zone_id exists (for role-based filtering)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'zone_id') THEN
        ALTER TABLE expenses ADD COLUMN zone_id UUID REFERENCES zones(id);
    END IF;

    -- 4. Unify category field length (Prevent truncation seen by subagent)
    ALTER TABLE expenses ALTER COLUMN category TYPE TEXT;
    ALTER TABLE expenses ALTER COLUMN vendor TYPE TEXT;
    ALTER TABLE expenses ALTER COLUMN description TYPE TEXT;

END $$;

COMMENT ON COLUMN expenses.start_km IS 'Initial mileage for transport expenses (Biofarco Logistics)';
COMMENT ON COLUMN expenses.end_km IS 'Final mileage for transport expenses (Biofarco Logistics)';
COMMENT ON COLUMN expenses.km_start_url IS 'Evidence photo URL for initial mileage';
COMMENT ON COLUMN expenses.km_end_url IS 'Evidence photo URL for final mileage';
COMMENT ON COLUMN expenses.custom_category IS 'Dynamic category name when non-standard category is used';
