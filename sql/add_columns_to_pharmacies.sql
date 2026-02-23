-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Add missing columns to pharmacies table if they don't exist
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS sector text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS rif text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS schedule text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS business_hours text;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload config';
