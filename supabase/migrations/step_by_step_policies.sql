-- CREAR POLÍTICAS UNA POR UNA

-- Primero limpiar
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
DROP POLICY IF EXISTS "test_org" ON organizations;

-- 1. ORGANIZATIONS SELECT
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id = get_my_organization_id());

-- 2. ORGANIZATIONS UPDATE
CREATE POLICY "Org admins can update organization" ON organizations
    FOR UPDATE USING (id = get_my_organization_id() AND is_org_admin());

-- 3. PROFILES
CREATE POLICY "Profiles org isolation" ON profiles
    FOR SELECT USING (id = auth.uid() OR organization_id = get_my_organization_id());

-- 4. CONTACTS
CREATE POLICY "Org Contact Access" ON contacts
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- 5. DOCTORS
CREATE POLICY "Org Doctors Access" ON doctors
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- 6. PHARMACIES
CREATE POLICY "Org Pharmacies Access" ON pharmacies
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- 7. HEALTH CENTERS
CREATE POLICY "Org Health Centers Access" ON health_centers
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- 8. PRODUCTS
CREATE POLICY "Org Products Access" ON products
    FOR ALL USING (organization_id = get_my_organization_id())
    WITH CHECK (organization_id = get_my_organization_id());

-- 9. VISITS
CREATE POLICY "Org Visits Access" ON visits
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor', 'telemarketing') OR
            (get_my_role() = 'representative' AND user_id = auth.uid())
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- 10. ZONES
CREATE POLICY "Org Zones Access" ON zones
    FOR ALL USING (organization_id = get_my_organization_id())
    WITH CHECK (organization_id = get_my_organization_id());

-- 11. USER ROLES
CREATE POLICY "Org User Roles Access" ON user_roles
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin') OR user_id = auth.uid()
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

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

SELECT 'COMPLETADO' as resultado, COUNT(*) as politicas FROM pg_policies WHERE schemaname = 'public';
