-- =====================================================
-- PASO 4: Políticas RLS para Multi-Tenant
-- Desactiva RLS primero, elimina políticas antiguas, crea nuevas
-- =====================================================

-- PRIMERO: Desactivar RLS en TODAS las tablas
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_centers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Tablas opcionales
DO $$ BEGIN ALTER TABLE transfer_orders DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE expenses DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE objectives DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE notifications DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- =====================================================
-- ELIMINAR POLÍTICAS ANTIGUAS
-- =====================================================
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Org admins can update organization" ON organizations;

DROP POLICY IF EXISTS "Profiles org isolation" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "RBAC Contact Select" ON contacts;
DROP POLICY IF EXISTS "RBAC Contact Insert" ON contacts;
DROP POLICY IF EXISTS "Org Contact Access" ON contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_mgmt_policy" ON contacts;

DROP POLICY IF EXISTS "Users can view their own doctors" ON doctors;
DROP POLICY IF EXISTS "Users can insert their own doctors" ON doctors;
DROP POLICY IF EXISTS "Users can update their own doctors" ON doctors;
DROP POLICY IF EXISTS "Users can delete their own doctors" ON doctors;
DROP POLICY IF EXISTS "Org Doctors Access" ON doctors;

DROP POLICY IF EXISTS "Users can view their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Users can insert their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Users can update their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Users can delete their own pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Org Pharmacies Access" ON pharmacies;

DROP POLICY IF EXISTS "RBAC Health Centers Select" ON health_centers;
DROP POLICY IF EXISTS "Org Health Centers Access" ON health_centers;

DROP POLICY IF EXISTS "Products Select" ON products;
DROP POLICY IF EXISTS "Products Management" ON products;
DROP POLICY IF EXISTS "Org Products Access" ON products;

DROP POLICY IF EXISTS "RBAC Visits Select" ON visits;
DROP POLICY IF EXISTS "Visits Access Policy" ON visits;
DROP POLICY IF EXISTS "Org Visits Access" ON visits;

DROP POLICY IF EXISTS "Zones visibility" ON zones;
DROP POLICY IF EXISTS "Org Zones Access" ON zones;

DROP POLICY IF EXISTS "RBAC User Roles Select" ON user_roles;
DROP POLICY IF EXISTS "RBAC User Roles Management" ON user_roles;
DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;

-- Políticas opcionales
DO $$ BEGIN DROP POLICY IF EXISTS "RBAC Transfer Orders Select" ON transfer_orders; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Org Transfer Orders Access" ON transfer_orders; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "RBAC Expenses Select" ON expenses; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Org Expenses Access" ON expenses; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "RBAC Objectives Select" ON objectives; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Org Objectives Access" ON objectives; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Org Notifications Access" ON notifications; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- =====================================================
-- CREAR NUEVAS POLÍTICAS (con RLS desactivado)
-- =====================================================

-- ORGANIZATIONS
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id = get_my_organization_id());
CREATE POLICY "Org admins can update organization" ON organizations
    FOR UPDATE USING (id = get_my_organization_id() AND is_org_admin());

-- PROFILES
CREATE POLICY "Profiles org isolation" ON profiles
    FOR SELECT USING (id::text = auth.uid()::text OR organization_id = get_my_organization_id());

-- CONTACTS
CREATE POLICY "Org Contact Access" ON contacts
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor' AND (zone_id = get_my_zone_id() OR zone_id IS NULL)) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- DOCTORS
CREATE POLICY "Org Doctors Access" ON doctors
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            get_my_role() = 'supervisor' OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- PHARMACIES
CREATE POLICY "Org Pharmacies Access" ON pharmacies
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            get_my_role() = 'supervisor' OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- HEALTH CENTERS
CREATE POLICY "Org Health Centers Access" ON health_centers
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- PRODUCTS
CREATE POLICY "Org Products Access" ON products
    FOR ALL USING (organization_id = get_my_organization_id())
    WITH CHECK (organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin', 'manager'));

-- VISITS
CREATE POLICY "Org Visits Access" ON visits
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'telemarketing') AND zone_id = get_my_zone_id()) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- ZONES
CREATE POLICY "Org Zones Access" ON zones
    FOR ALL USING (
        organization_id = get_my_organization_id() AND
        get_my_role() IN ('master', 'admin', 'manager', 'supervisor')
    ) WITH CHECK (organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin'));

-- USER ROLES
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

-- TABLAS OPCIONALES
DO $$ BEGIN
    CREATE POLICY "Org Transfer Orders Access" ON transfer_orders
        FOR ALL USING (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
                (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
            )
        ) WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Org Expenses Access" ON expenses
        FOR ALL USING (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
                (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
            )
        ) WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Org Objectives Access" ON objectives
        FOR ALL USING (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
                (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
            )
        ) WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Org Notifications Access" ON notifications
        FOR ALL USING (organization_id = get_my_organization_id() AND user_id::text = auth.uid()::text)
        WITH CHECK (organization_id = get_my_organization_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- =====================================================
-- FINALMENTE: Re-activar RLS en todas las tablas
-- =====================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN ALTER TABLE transfer_orders ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE expenses ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE objectives ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE notifications ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- =====================================================
-- DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE organizations IS 'Multi-tenant organization/company table';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN profiles.organization_id IS 'Organization this user belongs to';
COMMENT ON COLUMN profiles.is_org_admin IS 'Whether this user is an admin';

-- ¡MIGRACIÓN MULTI-TENANT COMPLETA! 🎉
