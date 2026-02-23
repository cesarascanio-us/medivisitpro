-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Add organization_id scoping to key views and tables
-- Created at: 2026-01-27
-- 1. Update View: view_farmacia_stock_actual
-- Recreating the view to include organization_id from the linked pharmacy
CREATE OR REPLACE VIEW view_farmacia_stock_actual AS
SELECT DISTINCT ON (r.pharmacy_id, r.producto_id) r.pharmacy_id AS farmacia_id,
    r.pharmacy_id,
    pr.name AS product_name,
    r.producto_id,
    r.cantidad_actual AS cantidad,
    r.cantidad_actual,
    r.tiene_stock,
    r.pvp,
    r.created_at AS last_audit_date,
    p.user_id,
    p.representative_id,
    p.organization_id
FROM registro_pvp_farmacia r
    JOIN products pr ON r.producto_id = pr.id
    JOIN pharmacies p ON r.pharmacy_id = p.id
ORDER BY r.pharmacy_id,
    r.producto_id,
    r.created_at DESC;
-- 2. Update Table: pharmacy_reports
-- Safely add organization_id column if it doesn't exist and backfill data
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'pharmacy_reports'
        AND column_name = 'organization_id'
) THEN
ALTER TABLE pharmacy_reports
ADD COLUMN organization_id UUID REFERENCES organizations(id);
-- Backfill existing records based on the pharmacy's organization
UPDATE pharmacy_reports pr
SET organization_id = p.organization_id
FROM pharmacies p
WHERE pr.pharmacy_id = p.id;
END IF;
END $$;