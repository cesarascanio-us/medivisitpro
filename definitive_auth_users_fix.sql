-- ========================================================================
-- DEFINITIVE FIX: PERMISSION DENIED FOR TABLE USERS
-- Este script ELIMINA las politicas ocultas que causaban el error.
-- ========================================================================

-- 1. Eliminar TODAS las politicas de master_users que puedan estar causando el error
DROP POLICY IF EXISTS "Users can read own master status" ON public.master_users;
DROP POLICY IF EXISTS "Users can view own master status" ON public.master_users;
DROP POLICY IF EXISTS "Permitir leer si es master" ON public.master_users;
DROP POLICY IF EXISTS "Master status visibility" ON public.master_users;

-- 2. Crear una única política limpia y segura sin consultar auth.users
CREATE POLICY "Users can view own master status safe" ON public.master_users 
FOR SELECT TO authenticated 
USING (email = auth.jwt() ->> 'email');

-- 3. Asegurar que las funciones master no consultan auth.users directamente
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY INVOKER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE;

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
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
