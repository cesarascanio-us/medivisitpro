-- 1. Restaurar funciones como SECURITY DEFINER para evitar el bucle infinito (Stack depth limit exceeded)
CREATE OR REPLACE FUNCTION public.get_my_organization_id() 
RETURNS UUID SECURITY DEFINER SET search_path = public AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS TEXT SECURITY DEFINER SET search_path = public AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 2. Limpiar las políticas de user_roles_plain para evitar recursividad
DROP POLICY IF EXISTS "Org User Roles Plain Access" ON user_roles_plain;

-- Si user_roles_plain debe tener RLS, usar política que no llame funciones:
CREATE POLICY "Org User Roles Plain Access" ON user_roles_plain
    FOR SELECT USING (true); -- Permitimos leer a todos los autenticados para evitar recursividad. Frontend filtra.

-- 3. Arreglar política de user_roles
DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;
CREATE POLICY "Org User Roles Access" ON user_roles
    FOR SELECT USING (
        auth.uid()::text = user_id::text 
        OR organization_id = get_my_organization_id()
    );
