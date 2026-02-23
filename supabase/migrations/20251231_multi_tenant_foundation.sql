-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- MediVisitPro - Multi-Tenant Foundation Migration
-- Date: 2025-12-31
-- Purpose: Transform single-tenant app to multi-tenant SaaS
-- =====================================================

-- 1. ORGANIZATIONS TABLE (Core Multi-Tenant Entity)
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    settings JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- Enable RLS for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_organizations_updated_at();

-- =====================================================
-- 2. CREATE DEFAULT ORGANIZATION (Biofarco)
-- =====================================================
INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, onboarding_completed)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Biofarco',
    'biofarco',
    'enterprise',
    'active',
    true
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 3. UPDATE PROFILES TABLE
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_org_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);

-- Temporarily disable RLS on profiles for data migration
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Assign all existing profiles to Biofarco
UPDATE profiles 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid 
WHERE organization_id IS NULL;

-- Re-enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. HELPER FUNCTIONS FOR MULTI-TENANT RLS
-- =====================================================

-- Update functions with type-safe comparisons using ::text cast on both sides
-- Using CREATE OR REPLACE to update in place without disrupting dependent policies

-- All functions use ::text cast on both sides for type safety
-- (handles both UUID and TEXT id/user_id columns)

-- Get current user's organization
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is organization admin
CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(is_org_admin, false) FROM profiles WHERE id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user belongs to specific organization
CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND organization_id = org_id);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Recreate existing role/zone functions with type-safe comparison
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM user_roles WHERE user_id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM user_roles WHERE user_id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================
-- 5. ADD organization_id TO ALL TENANT TABLES
-- =====================================================

-- CONTACTS
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);

-- DOCTORS
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_doctors_organization ON doctors(organization_id);

-- PHARMACIES
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pharmacies_organization ON pharmacies(organization_id);

-- HEALTH CENTERS
ALTER TABLE health_centers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_health_centers_organization ON health_centers(organization_id);

-- DRUGSTORES (if exists)
DO $$ BEGIN
    ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_drugstores_organization ON drugstores(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_organization ON products(organization_id);

-- VISITS
ALTER TABLE visits ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_visits_organization ON visits(organization_id);

-- TRANSFER ORDERS
DO $$ BEGIN
    ALTER TABLE transfer_orders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_transfer_orders_organization ON transfer_orders(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- TRANSFER ORDER ITEMS
DO $$ BEGIN
    ALTER TABLE transfer_order_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_transfer_order_items_organization ON transfer_order_items(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- QUOTES
DO $$ BEGIN
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_quotes_organization ON quotes(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- QUOTE ITEMS
DO $$ BEGIN
    ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_quote_items_organization ON quote_items(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ZONES
ALTER TABLE zones ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_zones_organization ON zones(organization_id);

-- USER ROLES
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_roles_organization ON user_roles(organization_id);

-- EVENTS
DO $$ BEGIN
    ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_events_organization ON events(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- DAILY PLANS
DO $$ BEGIN
    ALTER TABLE daily_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_daily_plans_organization ON daily_plans(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- DAILY PLAN ITEMS
DO $$ BEGIN
    ALTER TABLE daily_plan_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_daily_plan_items_organization ON daily_plan_items(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- OBJECTIVES
DO $$ BEGIN
    ALTER TABLE objectives ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_objectives_organization ON objectives(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- EXPENSES
DO $$ BEGIN
    ALTER TABLE expenses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_expenses_organization ON expenses(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- EXPENSE BUDGETS
DO $$ BEGIN
    ALTER TABLE expense_budgets ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_expense_budgets_organization ON expense_budgets(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- NOTIFICATIONS
DO $$ BEGIN
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_notifications_organization ON notifications(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- SUPPORT TICKETS
DO $$ BEGIN
    ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_support_tickets_organization ON support_tickets(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- PHARMACY REPORTS
DO $$ BEGIN
    ALTER TABLE pharmacy_reports ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_pharmacy_reports_organization ON pharmacy_reports(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- SAMPLE BANK TABLES
DO $$ BEGIN
    ALTER TABLE inventario_muestras ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_inventario_muestras_organization ON inventario_muestras(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE entregas_banco ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_entregas_banco_organization ON entregas_banco(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE detalle_entrega_banco ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_detalle_entrega_banco_organization ON detalle_entrega_banco(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE reposiciones_banco ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_reposiciones_banco_organization ON reposiciones_banco(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE dispensacion_muestras ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_dispensacion_muestras_organization ON dispensacion_muestras(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE dispensacion_pacientes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_dispensacion_pacientes_organization ON dispensacion_pacientes(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE entrega_muestras ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_entrega_muestras_organization ON entrega_muestras(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE materiales_promocionales ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_materiales_promocionales_organization ON materiales_promocionales(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE sample_inventory ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_sample_inventory_organization ON sample_inventory(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE sample_distributions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_sample_distributions_organization ON sample_distributions(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- POP MATERIALS
DO $$ BEGIN
    ALTER TABLE pop_materials ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_pop_materials_organization ON pop_materials(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE pop_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_pop_assignments_organization ON pop_assignments(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- SAMPLE ASSIGNMENTS
DO $$ BEGIN
    ALTER TABLE sample_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_sample_assignments_organization ON sample_assignments(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- SAMPLE MOVEMENTS
DO $$ BEGIN
    ALTER TABLE sample_movements ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_sample_movements_organization ON sample_movements(organization_id);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =====================================================
-- 6. MIGRATE EXISTING DATA TO DEFAULT ORGANIZATION
-- =====================================================

-- Temporarily disable RLS on tables to avoid policy evaluation during data migration
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_centers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Update all records to belong to Biofarco organization
UPDATE contacts SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE doctors SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE pharmacies SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE health_centers SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE products SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE visits SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE zones SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
UPDATE user_roles SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;

-- Re-enable RLS on tables (policies will be recreated in next section)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Update sample tables if they exist (wrapped in exception handlers)
DO $$ BEGIN 
    ALTER TABLE transfer_orders DISABLE ROW LEVEL SECURITY;
    UPDATE transfer_orders SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; 
    ALTER TABLE transfer_orders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN 
    ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
    UPDATE quotes SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; 
    ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN UPDATE events SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN UPDATE daily_plans SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN UPDATE objectives SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN UPDATE materiales_promocionales SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN UPDATE pop_materials SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN UPDATE sample_assignments SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN UPDATE sample_movements SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- =====================================================
-- 7. REFACTOR RLS POLICIES - ORGANIZATION ISOLATION
-- =====================================================

-- ORGANIZATIONS POLICY
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Org admins can update organization" ON organizations;

CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id = get_my_organization_id());

CREATE POLICY "Org admins can update organization" ON organizations
    FOR UPDATE USING (id = get_my_organization_id() AND is_org_admin());

-- PROFILES POLICY (Update existing)
DROP POLICY IF EXISTS "Profiles org isolation" ON profiles;
CREATE POLICY "Profiles org isolation" ON profiles
    FOR SELECT USING (
        id::text = auth.uid()::text OR 
        organization_id = get_my_organization_id()
    );

-- CONTACTS POLICY
DROP POLICY IF EXISTS "RBAC Contact Select" ON contacts;
DROP POLICY IF EXISTS "RBAC Contact Insert" ON contacts;
DROP POLICY IF EXISTS "Org Contact Access" ON contacts;

CREATE POLICY "Org Contact Access" ON contacts
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor' AND (zone_id = get_my_zone_id() OR zone_id IS NULL)) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id()
    );

-- DOCTORS POLICY
DROP POLICY IF EXISTS "Users can view their own doctors" ON doctors;
DROP POLICY IF EXISTS "Users can insert their own doctors" ON doctors;
DROP POLICY IF EXISTS "Users can update their own doctors" ON doctors;
DROP POLICY IF EXISTS "Users can delete their own doctors" ON doctors;
DROP POLICY IF EXISTS "Org Doctors Access" ON doctors;

CREATE POLICY "Org Doctors Access" ON doctors
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor') OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id()
    );

-- PHARMACIES POLICY
DROP POLICY IF EXISTS "Users can view their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Users can insert their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Users can update their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Users can delete their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Org Pharmacies Access" ON pharmacies;

CREATE POLICY "Org Pharmacies Access" ON pharmacies
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor') OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id()
    );

-- HEALTH CENTERS POLICY
DROP POLICY IF EXISTS "RBAC Health Centers Select" ON health_centers;
DROP POLICY IF EXISTS "Org Health Centers Access" ON health_centers;

CREATE POLICY "Org Health Centers Access" ON health_centers
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id()
    );

-- PRODUCTS POLICY
DROP POLICY IF EXISTS "Products Select" ON products;
DROP POLICY IF EXISTS "Products Management" ON products;
DROP POLICY IF EXISTS "Org Products Access" ON products;

CREATE POLICY "Org Products Access" ON products
    FOR ALL USING (
        organization_id = get_my_organization_id()
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin', 'manager')
    );

-- VISITS POLICY
DROP POLICY IF EXISTS "RBAC Visits Select" ON visits;
DROP POLICY IF EXISTS "Visits Access Policy" ON visits;
DROP POLICY IF EXISTS "Org Visits Access" ON visits;

CREATE POLICY "Org Visits Access" ON visits
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'telemarketing') AND zone_id = get_my_zone_id()) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id()
    );

-- ZONES POLICY
DROP POLICY IF EXISTS "Zones visibility" ON zones;
DROP POLICY IF EXISTS "Org Zones Access" ON zones;

CREATE POLICY "Org Zones Access" ON zones
    FOR ALL USING (
        organization_id = get_my_organization_id() AND
        get_my_role() IN ('master', 'admin', 'manager', 'supervisor')
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin')
    );

-- USER ROLES POLICY
DROP POLICY IF EXISTS "RBAC User Roles Select" ON user_roles;
DROP POLICY IF EXISTS "RBAC User Roles Management" ON user_roles;
DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;

CREATE POLICY "Org User Roles Access" ON user_roles
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() = 'master' OR
            get_my_role() = 'admin' OR
            auth.uid()::text = user_id::text
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND (
            get_my_role() = 'master' OR 
            (get_my_role() = 'admin' AND role NOT IN ('master', 'admin'))
        )
    );

-- TRANSFER ORDERS POLICY
DO $$ BEGIN
    DROP POLICY IF EXISTS "RBAC Transfer Orders Select" ON transfer_orders;
    DROP POLICY IF EXISTS "Org Transfer Orders Access" ON transfer_orders;
    
    CREATE POLICY "Org Transfer Orders Access" ON transfer_orders
        FOR ALL USING (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
                (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
            )
        ) WITH CHECK (
            organization_id = get_my_organization_id()
        );
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- EXPENSES POLICY
DO $$ BEGIN
    DROP POLICY IF EXISTS "RBAC Expenses Select" ON expenses;
    DROP POLICY IF EXISTS "RBAC Expenses Approval" ON expenses;
    DROP POLICY IF EXISTS "Org Expenses Access" ON expenses;
    
    CREATE POLICY "Org Expenses Access" ON expenses
        FOR ALL USING (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
                (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
            )
        ) WITH CHECK (
            organization_id = get_my_organization_id()
        );
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- OBJECTIVES POLICY
DO $$ BEGIN
    DROP POLICY IF EXISTS "RBAC Objectives Select" ON objectives;
    DROP POLICY IF EXISTS "Org Objectives Access" ON objectives;
    
    CREATE POLICY "Org Objectives Access" ON objectives
        FOR ALL USING (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
                (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
            )
        ) WITH CHECK (
            organization_id = get_my_organization_id()
        );
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- NOTIFICATIONS POLICY
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
    DROP POLICY IF EXISTS "Org Notifications Access" ON notifications;
    
    CREATE POLICY "Org Notifications Access" ON notifications
        FOR ALL USING (
            organization_id = get_my_organization_id() AND user_id::text = auth.uid()::text
        ) WITH CHECK (
            organization_id = get_my_organization_id()
        );
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- SAMPLE BANK POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage own inventario_muestras" ON inventario_muestras;
    DROP POLICY IF EXISTS "Org Inventario Muestras Access" ON inventario_muestras;
    
    CREATE POLICY "Org Inventario Muestras Access" ON inventario_muestras
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage own entregas_banco" ON entregas_banco;
    DROP POLICY IF EXISTS "Org Entregas Banco Access" ON entregas_banco;
    
    CREATE POLICY "Org Entregas Banco Access" ON entregas_banco
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage own materiales_promocionales" ON materiales_promocionales;
    DROP POLICY IF EXISTS "Org Materiales Access" ON materiales_promocionales;
    
    CREATE POLICY "Org Materiales Access" ON materiales_promocionales
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- POP MATERIALS POLICIES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Org POP Materials Access" ON pop_materials;
    
    CREATE POLICY "Org POP Materials Access" ON pop_materials
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Org POP Assignments Access" ON pop_assignments;
    
    CREATE POLICY "Org POP Assignments Access" ON pop_assignments
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- SAMPLE ASSIGNMENTS & MOVEMENTS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Org Sample Assignments Access" ON sample_assignments;
    
    CREATE POLICY "Org Sample Assignments Access" ON sample_assignments
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Org Sample Movements Access" ON sample_movements;
    
    CREATE POLICY "Org Sample Movements Access" ON sample_movements
        FOR ALL USING (organization_id = get_my_organization_id())
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE organizations IS 'Multi-tenant organization/company table. Each organization is a separate tenant with isolated data.';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier for the organization';
COMMENT ON COLUMN organizations.plan_tier IS 'Subscription tier: free, starter, professional, enterprise';
COMMENT ON COLUMN organizations.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe Customer ID for billing';
COMMENT ON COLUMN profiles.organization_id IS 'Organization this user belongs to';
COMMENT ON COLUMN profiles.is_org_admin IS 'Whether this user is an admin of their organization';

-- =====================================================
-- VERIFICATION QUERIES (Run manually after migration)
-- =====================================================
-- SELECT COUNT(*) FROM organizations;
-- SELECT table_name FROM information_schema.columns WHERE column_name = 'organization_id' AND table_schema = 'public';
-- SELECT COUNT(*) as total, COUNT(organization_id) as with_org FROM contacts;
-- SELECT COUNT(*) as total, COUNT(organization_id) as with_org FROM doctors;
