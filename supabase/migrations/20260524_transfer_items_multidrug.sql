-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- ========================================================================

-- Migration: Transfer Order Items - Multi-Drugstore Per Line
-- Date: 2026-05-24
-- Purpose: Adds drugstore_id and precio_fijado to transfer_order_items
--          so each product line can be dispatched by a different drugstore.
--          Also ensures transfer_orders has organization_id and pharmacy_id.

-- =====================================================
-- 1. Patch transfer_order_items
-- =====================================================

ALTER TABLE transfer_order_items
    ADD COLUMN IF NOT EXISTS drugstore_id UUID REFERENCES drugstores(id) ON DELETE SET NULL;

ALTER TABLE transfer_order_items
    ADD COLUMN IF NOT EXISTS precio_fijado NUMERIC(12, 2) DEFAULT 0;

-- =====================================================
-- 2. Patch transfer_orders - ensure core columns exist
-- =====================================================

ALTER TABLE transfer_orders
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE transfer_orders
    ADD COLUMN IF NOT EXISTS pharmacy_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE transfer_orders
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 3. RLS for transfer_order_items (if not already set)
-- =====================================================

ALTER TABLE transfer_order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'transfer_order_items'
        AND policyname = 'toi_org_select'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "toi_org_select" ON transfer_order_items FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM transfer_orders t
                    WHERE t.id = transfer_order_items.transfer_order_id
                    AND t.organization_id = get_my_organization_id()
                )
            )
        $policy$;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'transfer_order_items'
        AND policyname = 'toi_org_insert'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "toi_org_insert" ON transfer_order_items FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM transfer_orders t
                    WHERE t.id = transfer_order_items.transfer_order_id
                    AND t.organization_id = get_my_organization_id()
                )
            )
        $policy$;
    END IF;
END $$;

-- =====================================================
-- 4. Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_toi_drugstore ON transfer_order_items(drugstore_id);
CREATE INDEX IF NOT EXISTS idx_to_pharmacy ON transfer_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_to_org ON transfer_orders(organization_id);
