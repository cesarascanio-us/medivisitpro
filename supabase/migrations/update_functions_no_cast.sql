-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- ACTUALIZAR FUNCIONES SIN CASTS (todo es UUID)
-- Ejecutar PRIMERO antes de las políticas
-- =====================================================

-- Actualizar funciones para usar comparación UUID directa
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(is_org_admin, false) FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = org_id);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Verificar que las funciones se actualizaron
SELECT proname, prosrc FROM pg_proc 
WHERE proname IN ('get_my_role', 'get_my_organization_id') 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
