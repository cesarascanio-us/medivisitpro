-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add extra commercial/training columns to products table
-- Supports detailed Intelligence 360 mapping during product setup.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS selling_points JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS profitability_info TEXT,
    ADD COLUMN IF NOT EXISTS sales_tips TEXT,
    ADD COLUMN IF NOT EXISTS objection_handling TEXT;