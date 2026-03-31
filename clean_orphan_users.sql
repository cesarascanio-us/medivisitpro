-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Script para eliminar usuarios huérfanos (Corruptos)
-- El error recibido (23503) confirma que el usuario "Sin email" tiene un ID en user_roles
-- pero NO existe en el sistema de autenticación (auth.users).
-- No se le puede crear perfil ni asignar email porque "no existe" realmente.
-- Solución: Eliminar el registro corrupto de user_roles.
BEGIN;
-- 1. Eliminar de user_roles los IDs que no están en auth.users
DELETE FROM public.user_roles
WHERE user_id NOT IN (
        SELECT id
        FROM auth.users
    );
-- 2. Eliminar de profiles los IDs que no están en auth.users (por si acaso)
DELETE FROM public.profiles
WHERE user_id NOT IN (
        SELECT id
        FROM auth.users
    );
COMMIT;
-- Mensaje de éxito
DO $$ BEGIN RAISE NOTICE 'Limpieza de usuarios fantasmas completada. El usuario "Sin email" debería desaparecer.';
END $$;