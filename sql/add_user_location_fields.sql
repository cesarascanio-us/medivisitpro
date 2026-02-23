-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Add state and region to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS region text;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
