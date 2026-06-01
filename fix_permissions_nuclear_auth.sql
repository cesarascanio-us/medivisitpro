-- ========================================================================
-- NUCLEAR FIX FOR "PERMISSION DENIED FOR TABLE USERS" (FOREIGN KEY CHECK)
-- ========================================================================

-- 1. Redefinir is_system_master para no usar auth.users
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

-- 2. Redefinir is_master usando auth.jwt()
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IN ('cesar.ascanio@gmail.com', 'cesarascaniofp.us@gmail.com') THEN
    RETURN TRUE;
  END IF;
  RETURN public.is_system_master();
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- 3. EL VERDADERO PROBLEMA: CONSTRAINTS DE LLAVE FORÁNEA (FOREIGN KEYS)
-- PostgreSQL 15+ requiere que el rol que hace el UPDATE tenga permisos de SELECT
-- sobre la tabla referenciada (auth.users) para verificar la integridad referencial,
-- incluso si la columna user_id no cambia. 
-- Otorgamos SELECT solo a la columna 'id' para que la validación pase sin exponer datos sensibles.
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT (id) ON auth.users TO authenticated;

-- Por precaución, lo aplicamos también para el rol service_role
GRANT SELECT ON auth.users TO service_role;

-- 4. Recargar el schema en PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
