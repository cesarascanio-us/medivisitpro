-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- FIX: Reemplazar todas las consultas a auth.users con auth.jwt() ->> 'email'
-- para evitar el error "permission denied for table users" causado por SECURITY INVOKER
-- ========================================================================

-- 1. Actualizar is_system_master()
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY INVOKER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE;

-- 2. Actualizar la política de master_users
DROP POLICY IF EXISTS "Users can read own master status" ON public.master_users;
CREATE POLICY "Users can read own master status" ON public.master_users 
FOR SELECT TO authenticated 
USING (email = auth.jwt() ->> 'email');

-- 3. Actualizar public.is_master() (por si acaso fue modificado previamente)
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := auth.jwt() ->> 'email';
  RETURN user_email IN ('cesar.ascanio@gmail.com', 'cesarascaniofp.us@gmail.com') OR public.is_system_master();
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

-- Refrescar la configuración
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
