-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- NUCLEAR CLEANUP: Demo Medical Corp (V2)
-- Date: 2026-01-01
-- Purpose: Surgical deletion without trigger modification.
-- =====================================================

DO $$
DECLARE
  demo_email TEXT := 'demo@medivisitpro.com';
  demo_user_id UUID;
BEGIN
  -- 1. Identify the user ID
  SELECT id INTO demo_user_id FROM auth.users WHERE email = demo_email;

  -- 2. Delete from PUBLIC tables (Standard permissions)
  IF demo_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = demo_user_id;
    DELETE FROM public.profiles WHERE user_id = demo_user_id OR id = demo_user_id;
  END IF;
  
  -- Extra cleanup by email in public
  DELETE FROM public.profiles WHERE email = demo_email;

  -- 3. Delete from AUTH tables in strict order for FKs
  IF demo_user_id IS NOT NULL THEN
    -- Delete refresh tokens for all sessions of this user
    DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = demo_user_id);
    -- Delete sessions
    DELETE FROM auth.sessions WHERE user_id = demo_user_id;
    -- Delete identities
    DELETE FROM auth.identities WHERE user_id = demo_user_id;
    -- Delete the user itself
    DELETE FROM auth.users WHERE id = demo_user_id;
  END IF;

  -- 4. Final attempt by email (handles cases where ID search might have missed)
  DELETE FROM auth.users WHERE email = demo_email;

  RAISE NOTICE 'Surgical cleanup successful for %', demo_email;
END $$;
