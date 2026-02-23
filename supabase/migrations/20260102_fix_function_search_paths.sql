-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Fix for Security Advisor: "Function Search Path Mutable"
-- Set search_path = public to prevent hijacking.

-- 1. warehouse_inbound
ALTER FUNCTION public.warehouse_inbound(UUID, UUID, TEXT, INTEGER, DATE, TEXT)
    SET search_path = public;

-- 2. warehouse_dispatch
ALTER FUNCTION public.warehouse_dispatch(UUID, UUID, JSONB)
    SET search_path = public;

-- 3. log_changes (Trigger Function)
ALTER FUNCTION public.log_changes()
    SET search_path = public;

-- 4. get_nearby_pharmacies
ALTER FUNCTION public.get_nearby_pharmacies(UUID, FLOAT)
    SET search_path = public;

-- 5. check_event_eligibility
ALTER FUNCTION public.check_event_eligibility(UUID, TEXT)
    SET search_path = public;
