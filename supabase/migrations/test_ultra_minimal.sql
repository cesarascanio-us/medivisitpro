-- TEST ULTRA-MÍNIMO
-- Ejecutar cada línea por separado para ver cuál falla

-- 1. Política más simple posible (sin funciones)
CREATE POLICY "test1" ON organizations FOR SELECT USING (true);
DROP POLICY "test1" ON organizations;

-- 2. Política con get_my_organization_id
CREATE POLICY "test2" ON organizations FOR SELECT USING (id = get_my_organization_id());
DROP POLICY "test2" ON organizations;

-- 3. Política con get_my_role
CREATE POLICY "test3" ON contacts FOR SELECT USING (get_my_role() = 'master');
DROP POLICY "test3" ON contacts;

-- 4. Política con comparación user_id (el problema más probable)
CREATE POLICY "test4" ON contacts FOR SELECT USING (user_id::text = auth.uid()::text);
DROP POLICY "test4" ON contacts;

-- 5. Política completa de contacts
CREATE POLICY "test5" ON contacts FOR SELECT USING (
    organization_id = get_my_organization_id() AND (
        get_my_role() IN ('master', 'admin') OR
        user_id::text = auth.uid()::text
    )
);
DROP POLICY "test5" ON contacts;
