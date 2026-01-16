-- Migration: Phase 3 - Commercial Flow (Quotes & Detailed Orders)
-- Date: 2024-12-23

-- =====================================================
-- 1. Quotes System (Cotizaciones)
-- =====================================================

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Determine Zone from Contact
    pharmacy_name TEXT, 
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft', -- draft, sent, converted_to_order, cancelled
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0, -- Percentage or fixed amount
    total NUMERIC GENERATED ALWAYS AS (quantity * unit_price * (1 - COALESCE(discount,0)/100)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Refactor Transfer Orders (Detailed Items)
-- =====================================================
-- We keep the existing 'products' JSONB for backward compatibility 
-- but add a relational table for better analytics (Phase 3 requirement).

CREATE TABLE IF NOT EXISTS transfer_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_order_id UUID REFERENCES transfer_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    bonus_units INTEGER DEFAULT 0, -- "Bonificación" items
    subtotal NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. Pharmacy - Drugstore Relations
-- =====================================================
-- Tracks which Drugstore services which Pharmacy (crucial for order routing)

CREATE TABLE IF NOT EXISTS pharmacy_drugstore_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    drugstore_id UUID REFERENCES drugstores(id) ON DELETE CASCADE,
    account_number TEXT, -- Account number of pharmacy at this drugstore
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pharmacy_id, drugstore_id)
);

-- =====================================================
-- 4. RLS & Security
-- =====================================================

-- Quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quotes Access" ON quotes FOR ALL USING (
    get_my_role() IN ('master', 'admin', 'manager') OR
    (get_my_role() = 'representative' AND user_id = auth.uid()) OR 
    (get_my_role() IN ('supervisor', 'telemarketing')) -- Can see quotes in their zone (logic needs zone_id on quote or join)
);

-- Access to relations
ALTER TABLE pharmacy_drugstore_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Relation Access" ON pharmacy_drugstore_relations FOR ALL USING (true); -- Open for now, refine later

-- =====================================================
-- 5. Helper: Trigger to Sync JSONB -> Table (Optional)
-- =====================================================
-- For now, frontend will write to both or just use the new table.
-- We will assume the OrderBuilder writes to the new tables directly.
