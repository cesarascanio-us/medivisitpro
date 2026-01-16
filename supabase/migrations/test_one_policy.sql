-- TEST SIMPLE: Crear UNA sola política
DROP POLICY IF EXISTS "test_org" ON organizations;
CREATE POLICY "test_org" ON organizations FOR SELECT USING (id = get_my_organization_id());

-- Si esto funciona, muestra "Success!"
SELECT 'Success!' as result;
