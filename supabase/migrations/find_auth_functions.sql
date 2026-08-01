-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Buscar TODAS las funciones que contengan auth.uid
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%auth.uid%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
