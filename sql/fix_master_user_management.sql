-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- FIX: PERMISOS DE EDICIÓN PARA USUARIO MASTER
-- ========================================================================

-- 1. Asegurar que funcion is_master() responde correctamente.
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- We query auth.users directly. Security Definer skips RLS on public tables.
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  RETURN user_email = 'cesar.ascanio@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Asegurar que Master tiene control total sobre PROFILES
DROP POLICY IF EXISTS "Master can CRUD profiles" ON public.profiles;
CREATE POLICY "Master can CRUD profiles" 
ON public.profiles FOR ALL TO authenticated 
USING (public.is_master()) 
WITH CHECK (public.is_master());

-- 3. Asegurar que Master tiene control total sobre USER_ROLES
DROP POLICY IF EXISTS "Master can CRUD user_roles" ON public.user_roles;
CREATE POLICY "Master can CRUD user_roles" 
ON public.user_roles FOR ALL TO authenticated 
USING (public.is_master()) 
WITH CHECK (public.is_master());

-- 4. Asegurar que Master tiene control total sobre USER_ZONES
DROP POLICY IF EXISTS "Master can CRUD user_zones" ON public.user_zones;
CREATE POLICY "Master can CRUD user_zones" 
ON public.user_zones FOR ALL TO authenticated 
USING (public.is_master()) 
WITH CHECK (public.is_master());

-- 5. Dar acceso temporal a usuarios editando sus propios profiles solo en SELECT/UPDATE 
-- Si no tenian
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR public.is_master());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated 
USING (user_id = auth.uid());

-- Reload configuration just in case
NOTIFY pgrst, 'reload config';
