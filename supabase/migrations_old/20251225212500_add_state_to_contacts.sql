-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Add 'state' column to contacts table for regional filtering
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS state TEXT;

-- Update RLS or constraints if necessary (usually unrelated to adding a column)
-- Optional: Update existing contacts to have a default state if known, or leave NULL.
