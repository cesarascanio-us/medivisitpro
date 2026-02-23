-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Fix doctor_schedules foreign key
-- Date: 2026-02-18
-- Purpose: Point doctor_schedules.doctor_id to doctors table instead of contacts
DO $$ BEGIN -- 1. Drop the incorrect foreign key if it exists
IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'doctor_schedules_doctor_id_fkey'
        AND table_name = 'doctor_schedules'
) THEN
ALTER TABLE doctor_schedules DROP CONSTRAINT doctor_schedules_doctor_id_fkey;
END IF;
-- 2. Add the correct foreign key referencing doctors table
-- We assume doctors table exists and has id primary key (verified via other migrations)
ALTER TABLE doctor_schedules
ADD CONSTRAINT doctor_schedules_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;
RAISE NOTICE 'Fixed doctor_schedules_doctor_id_fkey to point to doctors table.';
END $$;