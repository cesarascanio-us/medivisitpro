-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
--
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Baremos & Quotes Enhancement
-- Date: 2026-05-24
-- Purpose: Creates the baremos (price list per drugstore) table and
--          adds organization_id to quotes for multi-tenancy.

-- =====================================================
-- 1. Baremos (Price Lists per Drugstore)
-- =====================================================

CREATE TABLE IF NOT EXISTS baremos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    drugstore_id UUID REFERENCES drugstores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, drugstore_id, product_id)
);

ALTER TABLE baremos ENABLE ROW LEVEL SECURITY;

-- All authenticated users in the org can read baremos; only admin/manager/master can write
CREATE POLICY "baremos_select" ON baremos FOR SELECT USING (
    organization_id = get_my_organization_id()
);

CREATE POLICY "baremos_insert" ON baremos FOR INSERT WITH CHECK (
    organization_id = get_my_organization_id()
    AND get_my_role() IN ('master', 'admin', 'manager')
);

CREATE POLICY "baremos_update" ON baremos FOR UPDATE USING (
    organization_id = get_my_organization_id()
    AND get_my_role() IN ('master', 'admin', 'manager')
);

CREATE POLICY "baremos_delete" ON baremos FOR DELETE USING (
    organization_id = get_my_organization_id()
    AND get_my_role() IN ('master', 'admin', 'manager')
);

-- =====================================================
-- 2. Patch quotes table - add organization_id if missing
-- =====================================================

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS drugstore_id UUID REFERENCES drugstores(id) ON DELETE SET NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- =====================================================
-- 3. Index for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_baremos_org ON baremos(organization_id);
CREATE INDEX IF NOT EXISTS idx_baremos_drugstore ON baremos(drugstore_id);
CREATE INDEX IF NOT EXISTS idx_baremos_product ON baremos(product_id);
CREATE INDEX IF NOT EXISTS idx_quotes_org ON quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- =====================================================
-- 4. Updated_at trigger for baremos
-- =====================================================

CREATE OR REPLACE FUNCTION update_baremos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_baremos_updated_at ON baremos;
CREATE TRIGGER trg_baremos_updated_at
    BEFORE UPDATE ON baremos
    FOR EACH ROW EXECUTE FUNCTION update_baremos_updated_at();
