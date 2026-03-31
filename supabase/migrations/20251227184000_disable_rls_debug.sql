-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Temporarily disable RLS to diagnose 400 Bad Request errors
-- If this fixes the issue, the problem is definitely within the Policy/Function recursion logic.

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;

-- Also disable for others if suspected
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
