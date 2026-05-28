-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- FIX: Modificamos is_master() para evitar el error "permission denied for table users"
-- ========================================================================

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Obtenemos el correo directamente del token JWT de la sesión actual
  -- Esto evita por completo consultar la tabla auth.users (lo que causa el error de permisos)
  user_email := auth.jwt() ->> 'email';
  
  -- Check for both allowed master emails
  RETURN user_email IN ('cesar.ascanio@gmail.com', 'cesarascaniofp.us@gmail.com');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- Reload configuration
NOTIFY pgrst, 'reload config';
