DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;
CREATE POLICY "Org User Roles Access" ON user_roles
    FOR SELECT USING (auth.uid()::text = user_id::text OR organization_id = get_my_organization_id() OR get_my_role() = 'master');

DROP POLICY IF EXISTS "Org User Roles Plain Access" ON user_roles_plain;
CREATE POLICY "Org User Roles Plain Access" ON user_roles_plain
    FOR SELECT USING (auth.uid() = user_id OR organization_id = get_my_organization_id() OR get_my_role() = 'master');
