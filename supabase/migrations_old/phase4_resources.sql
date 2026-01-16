-- Migration: Phase 4 - Intelligence & Resources
-- Date: 2024-12-23

-- 0. Helper Function for Triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 1. Expenses (Reporte de Gastos)
-- =====================================================

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT CHECK (category IN ('alim', 'hosp', 'trans', 'otros')) DEFAULT 'otros',
    receipt_url TEXT, -- URL to Storage
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users verify their own expenses. Managers/Admins verify all.
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expenses Access" ON expenses FOR ALL USING (
    get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
    (get_my_role() = 'representative' AND user_id = auth.uid())
);

-- =====================================================
-- 2. Fixed Assets (Activos Fijos)
-- =====================================================

CREATE TABLE IF NOT EXISTS fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- Asset Tag
    name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    condition TEXT DEFAULT 'good', -- new, good, fair, poor
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Everyone can read assets (or just their own?). 
-- Let's say Reps can read their own, Managers read all.
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets Select" ON fixed_assets FOR SELECT USING (
    get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
    assigned_to = auth.uid()
);

CREATE POLICY "Assets Modify" ON fixed_assets FOR ALL USING (
    get_my_role() IN ('master', 'admin', 'manager')
);

-- =====================================================
-- 3. Triggers
-- =====================================================

-- Auto-update updated_at for expenses
CREATE OR REPLACE TRIGGER update_expenses_modtime
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Auto-update updated_at for assets
CREATE OR REPLACE TRIGGER update_assets_modtime
    BEFORE UPDATE ON fixed_assets
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
