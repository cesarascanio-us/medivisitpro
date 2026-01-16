-- =====================================================
-- SOLUCIÓN SIN CASTS: Todo es UUID, no necesitamos ::text
-- =====================================================

-- Primero eliminar las políticas que pudieron crearse
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Org admins can update organization" ON organizations;
DROP POLICY IF EXISTS "Profiles org isolation" ON profiles;
DROP POLICY IF EXISTS "Org Contact Access" ON contacts;
DROP POLICY IF EXISTS "Org Doctors Access" ON doctors;
DROP POLICY IF EXISTS "Org Pharmacies Access" ON pharmacies;
DROP POLICY IF EXISTS "Org Health Centers Access" ON health_centers;
DROP POLICY IF EXISTS "Org Products Access" ON products;
DROP POLICY IF EXISTS "Org Visits Access" ON visits;
DROP POLICY IF EXISTS "Org Zones Access" ON zones;
DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;

-- ORGANIZATIONS (uuid = uuid)
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id = get_my_organization_id());

CREATE POLICY "Org admins can update organization" ON organizations
    FOR UPDATE USING (id = get_my_organization_id() AND is_org_admin());

-- PROFILES (id es uuid, auth.uid() es uuid)
CREATE POLICY "Profiles org isolation" ON profiles
    FOR SELECT USING (id = auth.uid() OR organization_id = get_my_organization_id());

-- CONTACTS (user_id es uuid)
CREATE POLICY "Org Contact Access" ON contacts
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor' AND (zone_id = get_my_zone_id() OR zone_id IS NULL)) OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- DOCTORS (user_id es uuid)
CREATE POLICY "Org Doctors Access" ON doctors
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- PHARMACIES
CREATE POLICY "Org Pharmacies Access" ON pharmacies
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- HEALTH CENTERS
CREATE POLICY "Org Health Centers Access" ON health_centers
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() = 'supervisor' AND zone_id = get_my_zone_id()) OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
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
            (get_my_role() = 'representative' AND user_id = auth.uid())
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
            get_my_role() IN ('master', 'admin') OR
            user_id = auth.uid()
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND (
            get_my_role() = 'master' OR 
            (get_my_role() = 'admin' AND role NOT IN ('master', 'admin'))
        )
    );

-- Habilitar RLS
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

-- Verificar
SELECT 'Políticas creadas:', COUNT(*) FROM pg_policies WHERE schemaname = 'public';
