-- Dar acceso de lectura a user_roles y user_roles_plain para toda la organización
DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;
DROP POLICY IF EXISTS "Org User Roles Manage" ON user_roles;

CREATE POLICY "Org User Roles Access" ON user_roles
    FOR SELECT USING (organization_id = get_my_organization_id() OR get_my_role() = 'master');
    
CREATE POLICY "Org User Roles Manage" ON user_roles
    FOR ALL USING (
        organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin')
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin')
    );

-- Para user_roles_plain si tuviese políticas (por seguridad)
DROP POLICY IF EXISTS "Org User Roles Plain Access" ON user_roles_plain;
CREATE POLICY "Org User Roles Plain Access" ON user_roles_plain
    FOR SELECT USING (organization_id = get_my_organization_id() OR get_my_role() = 'master');
