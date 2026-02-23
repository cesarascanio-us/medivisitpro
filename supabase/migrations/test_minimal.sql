-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- TEST MÍNIMO: Ejecutar línea por línea para encontrar el error
-- =====================================================

-- TEST 1: Verificar que las funciones existen y funcionan
SELECT get_my_organization_id();
-- Si falla aquí, el problema está en get_my_organization_id()

-- TEST 2: Verificar get_my_role
SELECT get_my_role();
-- Si falla aquí, el problema está en get_my_role()

-- TEST 3: Crear política simple en organizations
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "test_policy" ON organizations;
CREATE POLICY "test_policy" ON organizations FOR SELECT USING (true);
-- Si esto funciona, el problema no está en organizations

-- TEST 4: Crear política que usa get_my_organization_id
DROP POLICY IF EXISTS "test_policy" ON organizations;
CREATE POLICY "test_policy" ON organizations FOR SELECT USING (id = get_my_organization_id());
-- Si falla aquí, el problema es get_my_organization_id() en contexto de política

-- TEST 5: Probar política en contacts
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "test_contacts" ON contacts;
CREATE POLICY "test_contacts" ON contacts FOR SELECT USING (organization_id = get_my_organization_id());
-- Si falla aquí, el problema es la comparación organization_id = get_my_organization_id()

-- TEST 6: Probar con get_my_role
DROP POLICY IF EXISTS "test_contacts" ON contacts;
CREATE POLICY "test_contacts" ON contacts FOR SELECT USING (get_my_role() = 'master');
-- Si falla aquí, el problema es get_my_role() en contexto de política

-- TEST 7: Probar comparación user_id
DROP POLICY IF EXISTS "test_contacts" ON contacts;
CREATE POLICY "test_contacts" ON contacts FOR SELECT USING (user_id::text = auth.uid()::text);
-- Si falla aquí, el problema es la comparación user_id

-- LIMPIAR después del test
DROP POLICY IF EXISTS "test_policy" ON organizations;
DROP POLICY IF EXISTS "test_contacts" ON contacts;
