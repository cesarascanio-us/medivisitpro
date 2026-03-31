-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add out_of_range field to visits table
-- This field tracks when a representative checks in from a location
-- that is more than 500 meters away from the registered address

ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS out_of_range BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN visits.out_of_range IS 'Indicates if check-in was performed >500m from registered location';
