-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- LIMPIEZA TOTAL DE USUARIOS "FANTASMA" (BIOFARCO & OTROS)
-- =============================================
-- Este script purga a los usuarios que quedaron huérfanos tras la eliminación
-- de sus organizaciones, manteniendo intacta tu cuenta Master Global.
BEGIN;
-- 1. Identificar y eliminar roles vinculados a organizaciones que ya no existen
-- (Excepto el Master Global que tiene organization_id = NULL)
DELETE FROM public.user_roles
WHERE organization_id IS NOT NULL
    AND organization_id NOT IN (
        SELECT id
        FROM public.organizations
    );
-- 2. Eliminar perfiles vinculados a organizaciones inexistentes
DELETE FROM public.profiles
WHERE organization_id IS NOT NULL
    AND organization_id NOT IN (
        SELECT id
        FROM public.organizations
    );
-- 3. Limpiar usuarios en public.profiles que ya no están en Supabase Auth (auth.users)
-- Esto sucede cuando se borra un usuario desde el panel de Supabase pero queda el perfil.
DELETE FROM public.profiles
WHERE user_id NOT IN (
        SELECT id
        FROM auth.users
    );
-- 4. Limpiar roles en public.user_roles que ya no están en Supabase Auth
DELETE FROM public.user_roles
WHERE user_id NOT IN (
        SELECT id
        FROM auth.users
    );
-- 5. OPCIONAL: Limpiar perfiles que no tienen un rol asignado
-- (A menos que sea un usuario recién creado esperando asignación)
DELETE FROM public.profiles
WHERE user_id NOT IN (
        SELECT user_id
        FROM public.user_roles
    );
COMMIT;
-- VERIFICACIÓN
DO $$
DECLARE clean_count_profiles INTEGER;
clean_count_roles INTEGER;
BEGIN
SELECT COUNT(*) INTO clean_count_profiles
FROM public.profiles;
SELECT COUNT(*) INTO clean_count_roles
FROM public.user_roles;
RAISE NOTICE 'Limpieza completada.';
RAISE NOTICE 'Perfiles activos restantes: %',
clean_count_profiles;
RAISE NOTICE 'Roles activos restantes: %',
clean_count_roles;
END $$;