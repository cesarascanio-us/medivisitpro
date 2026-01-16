-- =====================================================
-- PASO 4B: CREAR POLÍTICAS (versión simplificada)
-- Sin ALTER TABLE problemáticos
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
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    ) WITH CHECK (organization_id = get_my_organization_id());

-- PHARMACIES
CREATE POLICY "Org Pharmacies Access" ON pharmacies
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR
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
            get_my_role() IN ('master', 'admin') OR
            auth.uid()::text = user_id::text
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND (
            get_my_role() = 'master' OR 
            (get_my_role() = 'admin' AND role NOT IN ('master', 'admin'))
        )
    );

-- Re-habilitar RLS en tablas principales
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

-- ¡MIGRACIÓN MULTI-TENANT COMPLETA! 🎉
