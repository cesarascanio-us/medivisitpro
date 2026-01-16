-- =====================================================
-- PHASE 1: STRATEGIC PLANNING SCHEMA
-- =====================================================

-- 1. CICLOS (Commercial Cycles)
CREATE TABLE IF NOT EXISTS cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Enero 2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'planning'
    goals_json JSONB DEFAULT '{}'::jsonb, -- Flexible goals storage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cycles" ON cycles FOR SELECT USING (true);
CREATE POLICY "Admins manage cycles" ON cycles USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'manager')));

-- 2. FICHERO GENERAL (Unified Directory)
-- This table aggregates Doctors and Pharmacies for easy planning reference
CREATE TABLE IF NOT EXISTS directory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id UUID NOT NULL, -- ID of the Doctor or Pharmacy
    entity_type TEXT NOT NULL, -- 'doctor', 'pharmacy'
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    zone_id UUID, -- For filtering by zone
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(entity_id, entity_type)
);

ALTER TABLE directory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read directory" ON directory_items FOR SELECT USING (true);

-- Triggers to sync Directory from Doctors/Pharmacies would strictly go here, 
-- but for now we will rely on application logic or initial population script.

-- 3. PLANIFICACION SEMANAL (Weekly Header)
CREATE TABLE IF NOT EXISTS weekly_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    cycle_id UUID NOT NULL REFERENCES cycles(id),
    week_number INTEGER NOT NULL, -- 1 to 4/5 relative to cycle or year
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
    supervisor_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON weekly_plans USING (auth.uid() = user_id);
-- Supervisor policy would be needed here contextually

-- 4. DETALLE PLANIFICACION (Daily Blocks)
CREATE TABLE IF NOT EXISTS daily_plan_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL, -- 'Monday', 'Tuesday', ...
    date DATE NOT NULL,
    directory_item_id UUID NOT NULL REFERENCES directory_items(id), -- Points to the unified directory
    turn TEXT DEFAULT 'AM', -- 'AM', 'PM'
    visit_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'planned', -- 'planned', 'visited', 'missed'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_plan_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own details" ON daily_plan_details USING (auth.uid() IN (
    SELECT user_id FROM weekly_plans WHERE id = daily_plan_details.weekly_plan_id
));

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_plans_updated_at BEFORE UPDATE ON weekly_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
