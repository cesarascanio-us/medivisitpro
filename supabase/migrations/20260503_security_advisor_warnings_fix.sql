-- ========================================================================
-- SECURITY ADVISOR WARNINGS FIX - MEDIVISITPRO
-- Fecha: 2026-05-03
-- Objetivo: Resolver los 8 warnings de "SECURITY DEFINER"
-- ========================================================================

-- Es necesario eliminar las funciones previas porque Postgres 
-- no permite cambiar ciertas firmas directamente con REPLACE.
DROP FUNCTION IF EXISTS public.get_my_organization_id();
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.is_master();
DROP FUNCTION IF EXISTS public.is_system_master();
DROP FUNCTION IF EXISTS public.is_system_master(TEXT);

-- 1. get_my_organization_id()
CREATE OR REPLACE FUNCTION public.get_my_organization_id() 
RETURNS UUID SECURITY INVOKER AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = public;

-- 2. get_my_role()
CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS TEXT SECURITY INVOKER AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = public;

-- 3. is_system_master()
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY INVOKER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

-- 4. is_system_master(p_email TEXT)
CREATE OR REPLACE FUNCTION public.is_system_master(p_email TEXT)
RETURNS BOOLEAN SECURITY INVOKER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = LOWER(TRIM(p_email)) AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

-- 5. is_master()
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY INVOKER AS $$
    SELECT public.is_system_master();
$$ LANGUAGE sql STABLE SET search_path = public;

-- REVOCAR ACCESO PÚBLICO INNECESARIO PARA MAYOR SEGURIDAD
REVOKE EXECUTE ON FUNCTION public.get_my_organization_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_organization_id() FROM anon;

REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_system_master() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_system_master() FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_system_master(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_system_master(TEXT) FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_master() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_master() FROM anon;

NOTIFY pgrst, 'reload schema';
