-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- CLEAN DELETE MANAGER (For Re-creation Test)
-- =====================================================

-- 1. Correct permissions first (just in case)
ALTER ROLE authenticator SET search_path = public, auth, extensions;

-- 2. Delete the user from AUTH (Cascades to profiles usually, but we force it)
DELETE FROM auth.identities WHERE identity_data->>'email' = 'cesarascanio.edu@gmail.com';
DELETE FROM auth.users WHERE email = 'cesarascanio.edu@gmail.com';

-- 3. Ensure profile didn't survive (Manually cleanup to be sure)
DELETE FROM public.profiles WHERE email = 'cesarascanio.edu@gmail.com';
DELETE FROM public.user_roles WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.user_roles_plain WHERE user_id NOT IN (SELECT id FROM auth.users);

DO $$
BEGIN
    RAISE NOTICE 'User cesarascanio.edu@gmail.com has been completely REMOVED.';
END $$;
