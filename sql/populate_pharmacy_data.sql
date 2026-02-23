-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Update existing pharmacies to have a state so filtering works
-- This is a temporary population to verify functionality

-- Update some to Aragua. Explicitly NOT setting region as it's not a column.
UPDATE public.pharmacies
SET state = 'Aragua'
WHERE state IS NULL;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
