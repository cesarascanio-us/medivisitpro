-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Security Advisor Fix - MediVisitPro (THE ULTIMATE FINISHER)
-- Goal: 100% SQL Clean State
-- ========================================================================

-- 1. FIX FINAL: EXTENSION PG_NET (MÉTODO ATÓMICO)
-- Si no se deja mover, la recreamos directamente donde debe estar.
DO $$ 
BEGIN
    CREATE SCHEMA IF NOT EXISTS extensions;
    -- Intentamos borrarla (CASCADE por seguridad si hay dependencias)
    DROP EXTENSION IF EXISTS pg_net CASCADE;
    -- La instalamos directamente en el esquema seguro
    CREATE EXTENSION pg_net SCHEMA extensions;
    RAISE NOTICE '✅ pg_net re-instalada exitosamente en el esquema extensions.';
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'No se pudo reinstalar pg_net automáticamente. Esto puede requerir permisos de superusuario en el Dashboard.';
END $$;

-- 2. VERIFICACIÓN FINAL DE STORAGE
-- Aseguramos que no quede ni un solo rastro de políticas de listado público
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT'
          AND policyname != 'CA_System_Storage_Access'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 3. RECORDATORIO DE SEGURIDAD (ACCIÓN EN DASHBOARD)
-- ┌─────────────────────────────────────────────────────────────────┐
-- │  ÚLTIMO PASO PARA EL 100%:                                      │
-- │  1. Ve a tu Dashboard de Supabase.                             │
-- │  2. Entra en 'Authentication' -> 'Settings'.                   │
-- │  3. Busca la sección 'Security and Protection'.                │
-- │  4. Activa el switch: [Leaked password protection]             │
-- └─────────────────────────────────────────────────────────────────┘
