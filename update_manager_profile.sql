-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Update the profile for the manager user
UPDATE public.profiles
SET first_name = 'César',
    last_name = 'Ascanio'
WHERE email = 'cesarascanio.edu@gmail.com';
-- Verify the update
SELECT *
FROM public.profiles
WHERE email = 'cesarascanio.edu@gmail.com';