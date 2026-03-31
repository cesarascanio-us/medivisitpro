-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- SYSTEM REPAIR & MANUAL CONFIRMATION
-- Date: 2026-01-02
-- Purpose: 
-- 1. Fix "Database error finding user" (Search Path / Trigger Fix)
-- 2. Force Confirm the manager account (Bypass broken email service)
-- =====================================================

-- [PHASE 1: SYSTEM PERMISSIONS]
-- Ensure the authenticator can always see the auth and public schemas
ALTER ROLE authenticator SET search_path = public, auth;
ALTER ROLE postgres SET search_path = public, auth, extensions;
GRANT USAGE ON SCHEMA auth TO postgres, authenticator;
GRANT SELECT ON auth.users TO postgres, authenticator;
GRANT SELECT ON auth.identities TO postgres, authenticator;

-- [PHASE 2: TRIGGER CLEANUP]
-- Triggers on auth.users are the #1 cause of "Database error finding user"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- [PHASE 3: MANUAL CONFIRMATION]
-- This bypasses the need for the "Resend Email" button which is currently crashing
UPDATE auth.users 
SET 
    email_confirmed_at = now(),
    updated_at = now(),
    last_sign_in_at = now()
WHERE email = 'cesarascanio.edu@gmail.com';

-- [PHASE 4: REFRESH CACHE]
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    RAISE NOTICE 'System repair complete. Manager account confirmed manually.';
    RAISE NOTICE 'Please try to LOGIN now with password 123456.';
END $$;
