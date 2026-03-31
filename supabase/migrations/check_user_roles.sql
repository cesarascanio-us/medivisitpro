-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Ver TODAS las columnas de user_roles
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_roles'
ORDER BY ordinal_position;
