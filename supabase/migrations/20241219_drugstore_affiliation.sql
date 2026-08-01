-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Drugstore Affiliation Update
-- Adds contact_id to drugstores to allow associating drugstores with specific pharmacies

-- 1. Add contact_id to drugstores table
ALTER TABLE drugstores 
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE;

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS idx_drugstores_contact_id ON drugstores(contact_id);

-- 3. Update existing data (optional, but good for consistency)
-- If we want to keep current drugstores as "global" templates, we leave contact_id as NULL.
-- New affiliations will have contact_id populated.

-- 4. Update order logic (nothing to change in table, but UI will use it)
COMMENT ON COLUMN drugstores.contact_id IS 'Asociación con una farmacia específica. NULL si es una plantilla global.';
