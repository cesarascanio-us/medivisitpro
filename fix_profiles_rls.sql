-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Script para permitir a Gerentes, Admins y Supervisores ver TODOS los perfiles (profiles)
-- Esto corregirá que el dropdown de "Representantes" aparezca vacío.
-- 1. Política para PERFILES (profiles)
-- Primero eliminamos políticas que puedan estar restringiendo
DROP POLICY IF EXISTS "Managers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Read access for authenticated users" ON profiles;
-- Política: Si eres Manager/Admin/Master/Supervisor puedes ver TODOS los perfiles.
-- Si eres representante, sigues viendo solo el tuyo (o todos si fuera necesario para directorio, pero restringimos por ahora).
CREATE POLICY "Dashboard Access Policy - Profiles" ON profiles FOR
SELECT USING (
        (auth.uid() = user_id)
        OR EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role IN ('manager', 'admin', 'master', 'supervisor')
        )
    );
-- 2. Refuerzo para USER_ROLES (vital para que funcionen los filtros)
DROP POLICY IF EXISTS "Read access for authenticated users" ON user_roles;
CREATE POLICY "Read access for authenticated users" ON user_roles FOR
SELECT TO authenticated USING (true);
-- 3. Asegurar acceso a ZONES
DROP POLICY IF EXISTS "Read access for authenticated users" ON zones;
CREATE POLICY "Read access for authenticated users" ON zones FOR
SELECT TO authenticated USING (true);