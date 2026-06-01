
-- Permitir a los supervisores ver los usuarios de su organización
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
CREATE POLICY "Org User Roles Access" ON public.user_roles
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager', 'supervisor') OR user_id = auth.uid()
        )
    ) WITH CHECK (
        organization_id = get_my_organization_id() AND get_my_role() IN ('master', 'admin')
    );

DROP POLICY IF EXISTS "Org User Roles Plain Access" ON public.user_roles_plain;
CREATE POLICY "Org User Roles Plain Access" ON public.user_roles_plain
    FOR SELECT USING (
        organization_id = get_my_organization_id() OR get_my_role() = 'master'
    );

