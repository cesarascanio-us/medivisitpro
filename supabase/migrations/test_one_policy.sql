-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- TEST SIMPLE: Crear UNA sola política
DROP POLICY IF EXISTS "test_org" ON organizations;
CREATE POLICY "test_org" ON organizations FOR SELECT USING (id = get_my_organization_id());

-- Si esto funciona, muestra "Success!"
SELECT 'Success!' as result;
