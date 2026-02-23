-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- RESTORE USER SYNC & FIX MISSING EMAILS
-- Purpose: 
-- 1. Restore the `on_auth_user_created` trigger (SAFE VERSION).
-- 2. Backfill missing emails for "Sin email" profiles.
-- 3. Ensure profiles exist for all auth users.
-- =====================================================

-- [STEP 1: CREATE SAFE TRIGGER FUNCTION]
-- This function syncs Auth -> Public.Profiles without recursion.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, created_at, updated_at)
  VALUES (
    new.id,
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    first_name = CASE WHEN public.profiles.first_name = '' THEN EXCLUDED.first_name ELSE public.profiles.first_name END,
    last_name = CASE WHEN public.profiles.last_name = '' THEN EXCLUDED.last_name ELSE public.profiles.last_name END,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- [STEP 2: BIND TRIGGER]
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- [STEP 3: BACKFILL MISSING PROFILES]
-- Insert profiles for any auth user that doesn't have one
-- We provide default names to satisfy NOT NULL constraints
INSERT INTO public.profiles (id, user_id, email, first_name, last_name, created_at, updated_at)
SELECT 
    id, 
    id, 
    email, 
    'Usuario',      -- Default first_name
    'Temporal',     -- Default last_name
    created_at, 
    now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;

-- [STEP 4: FIX "SIN EMAIL" PROFILES]
-- Update existing profiles where email is null but exists in auth.users
UPDATE public.profiles p
SET email = a.email
FROM auth.users a
WHERE p.user_id = a.id
AND (p.email IS NULL OR p.email = '');

DO $$
BEGIN
    RAISE NOTICE 'User synchronization restored and data repaired.';
END $$;
