-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- NUCLEAR OPTION: Drop ALL triggers on auth.users
-- This ensures no hidden/legacy logic blocks the login process.

DO $$
DECLARE
    trg RECORD;
BEGIN
    FOR trg IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' 
        AND event_object_table = 'users'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users;', trg.trigger_name);
        RAISE NOTICE 'Dropped trigger: %', trg.trigger_name;
    END LOOP;
END $$;

-- Verify pgcrypto is available (Supabase Auth relies on it)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Re-grant basic permissions just in case
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Reload Schema Cache one last time
NOTIFY pgrst, 'reload config';
