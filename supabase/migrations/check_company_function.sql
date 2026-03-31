-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Ver la función get_user_company_id completa
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_user_company_id'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- También ver create_new_user ya que puede insertar con tipos incorrectos
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'create_new_user'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
