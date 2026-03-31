-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- MediVisitPro - Satisfy Security Advisor
-- Enables RLS on user_roles_plain without causing recursion
-- =============================================

BEGIN;

-- 1. Enable RLS on the cache table
ALTER TABLE public.user_roles_plain ENABLE ROW LEVEL SECURITY;

-- 2. Add a simple, non-recursive policy for SELECT
-- This allows anyone to see THEIR OWN role in the cache.
-- This is secure and breaks the recursion loop.
DROP POLICY IF EXISTS "urp_select_safe" ON public.user_roles_plain;
CREATE POLICY "urp_select_safe" ON public.user_roles_plain
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- NOTE: No policies for INSERT/UPDATE/DELETE are needed for 'authenticated'.
-- The 'trigger_sync_user_roles_plain' function is SECURITY DEFINER and 
-- will handle synchronization automatically, bypassing RLS.
DROP POLICY IF EXISTS "urp_mgmt_safe" ON public.user_roles_plain;
DROP POLICY IF EXISTS "urp_all" ON public.user_roles_plain;

COMMIT;

-- 4. REFRESH
NOTIFY pgrst, 'reload config';
