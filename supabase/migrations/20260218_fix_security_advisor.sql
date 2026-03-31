-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- SECURITY ADVISOR FIXES
-- Date: 2026-02-18
-- Purpose: Resolve RLS and Search Path vulnerabilities
-- =====================================================
-- 1. FIX: RLS Disabled in public.master_audit_logs
-- The table was created but RLS was not enabled, exposing it if policies were not set (default deny is better than open).
ALTER TABLE public.master_audit_logs ENABLE ROW LEVEL SECURITY;
-- Optional: Add a policy so the Master User can actually see their logs (if needed in UI)
-- Otherwise, the table is locked down to service_role only.
-- creating a basic policy for now:
CREATE POLICY "Masters can view their own audit logs" ON public.master_audit_logs FOR
SELECT USING (auth.uid() = master_id);
-- 2. FIX: Function Search Path Mutable in public.sync_user_org_consistency
-- Functions with SECURITY DEFINER must have a logical search_path set to prevent hijacking.
CREATE OR REPLACE FUNCTION public.sync_user_org_consistency() RETURNS TRIGGER AS $$ BEGIN
UPDATE public.profiles
SET organization_id = NEW.organization_id
WHERE user_id = NEW.user_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
-- This fixes the security warning