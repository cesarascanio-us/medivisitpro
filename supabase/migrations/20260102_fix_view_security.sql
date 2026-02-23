-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Fix for Security Advisor: "Security Definer View"
-- By default, views run with the owner's permissions (usually postgres/superuser).
-- We need to enforce RLS for the user invoking the view (`security_invoker = true`).

ALTER VIEW public.view_warehouse_stock SET (security_invoker = true);
