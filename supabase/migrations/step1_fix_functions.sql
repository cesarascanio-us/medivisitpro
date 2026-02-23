-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- PASO 1: Ejecuta primero SOLO esta parte para corregir las funciones
-- Copia y ejecuta en Supabase SQL Editor
-- =====================================================

-- Actualizar get_my_role con cast seguro de tipos
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM user_roles WHERE user_id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Actualizar get_my_zone_id con cast seguro de tipos
CREATE OR REPLACE FUNCTION get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM user_roles WHERE user_id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Si el PASO 1 funciona, continúa con el PASO 2 en el archivo principal
