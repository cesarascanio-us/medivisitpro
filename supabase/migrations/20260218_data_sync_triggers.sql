-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Add visit synchronization columns and triggers
-- Target tables: contacts, doctors, pharmacies, health_centers
-- 1. Schema Updates
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS last_visit DATE;
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
-- last_visit already exists
ALTER TABLE pharmacies
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
-- last_visit already exists
ALTER TABLE health_centers
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
-- last_visit already exists
-- 2. Trigger Function for Synchronization
CREATE OR REPLACE FUNCTION fn_sync_contact_visit_stats() RETURNS TRIGGER AS $$
DECLARE v_entity_id UUID;
v_entity_type TEXT;
v_scheduled_date DATE;
BEGIN -- Only proceed for 'completed' visits
IF NEW.status = 'completed'
AND (
    OLD.status IS NULL
    OR OLD.status != 'completed'
) THEN v_scheduled_date := NEW.scheduled_date::DATE;
-- CASE A: Direct link via contact_id (Legacy/General)
IF NEW.contact_id IS NOT NULL THEN
UPDATE contacts
SET visit_count = visit_count + 1,
    last_visit = GREATEST(
        COALESCE(last_visit, '1900-01-01'::DATE),
        v_scheduled_date
    )
WHERE id = NEW.contact_id;
END IF;
-- CASE B: Direct link via pharmacy_id
IF NEW.pharmacy_id IS NOT NULL THEN
UPDATE pharmacies
SET visit_count = visit_count + 1,
    last_visit = GREATEST(
        COALESCE(last_visit, '1900-01-01'::DATE),
        v_scheduled_date
    )
WHERE id = NEW.pharmacy_id;
END IF;
-- CASE C: Polymorphic link via directory_item_id
IF NEW.directory_item_id IS NOT NULL THEN
SELECT entity_id,
    entity_type INTO v_entity_id,
    v_entity_type
FROM directory_items
WHERE id = NEW.directory_item_id;
IF v_entity_id IS NOT NULL THEN IF v_entity_type = 'doctor' THEN
UPDATE doctors
SET visit_count = visit_count + 1,
    last_visit = GREATEST(
        COALESCE(last_visit, '1900-01-01'::DATE),
        v_scheduled_date
    )
WHERE id = v_entity_id;
ELSIF v_entity_type = 'pharmacy' THEN
UPDATE pharmacies
SET visit_count = visit_count + 1,
    last_visit = GREATEST(
        COALESCE(last_visit, '1900-01-01'::DATE),
        v_scheduled_date
    )
WHERE id = v_entity_id;
ELSIF v_entity_type = 'health_center' THEN
UPDATE health_centers
SET visit_count = visit_count + 1,
    last_visit = GREATEST(
        COALESCE(last_visit, '1900-01-01'::DATE),
        v_scheduled_date
    )
WHERE id = v_entity_id;
END IF;
END IF;
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 3. Attach Trigger
DROP TRIGGER IF EXISTS tr_sync_visit_stats ON visits;
CREATE TRIGGER tr_sync_visit_stats
AFTER
UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION fn_sync_contact_visit_stats();