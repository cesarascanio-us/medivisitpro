-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add organization_id to doctors to fix 400 Bad Request
-- Date: 2026-01-31
-- 1. Add organization_id to doctores
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_doctors_organization ON public.doctors(organization_id);
-- 3. Update existing records (optional, set to user's org if possible, or null)
-- This assumes a function or logic exists, but for now we leave null and rely on RLS/App logic to fill it.
-- 4. Enable RLS on organization_id if needed (Policy update)
-- Existing policies use auth.uid() = user_id. We might need org-based policies later.