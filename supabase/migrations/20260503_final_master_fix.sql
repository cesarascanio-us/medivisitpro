-- ========================================================================
-- FINAL SECURITY & MASTER GOD MODE STABILIZATION - SAFE VERSION
-- Fecha: 2026-05-03
-- Objetivo: Restaurar funcionalidad master, corregir permisos de funciones
-- y asegurar visibilidad global SIN romper dependencias RLS.
-- ========================================================================

-- [PASO 1] ACTUALIZAR MODO DE SEGURIDAD (ALTER EN LUGAR DE DROP)
-- Usamos ALTER para no romper las políticas RLS que dependen de estas funciones.
ALTER FUNCTION public.get_my_organization_id() SECURITY INVOKER;
ALTER FUNCTION public.get_my_organization_id() SET search_path = public;

ALTER FUNCTION public.get_my_role() SECURITY INVOKER;
ALTER FUNCTION public.get_my_role() SET search_path = public;

ALTER FUNCTION public.is_system_master() SECURITY INVOKER;
ALTER FUNCTION public.is_system_master() SET search_path = public;

ALTER FUNCTION public.is_system_master(TEXT) SECURITY INVOKER;
ALTER FUNCTION public.is_system_master(TEXT) SET search_path = public;

ALTER FUNCTION public.is_master() SECURITY INVOKER;
ALTER FUNCTION public.is_master() SET search_path = public;

-- [PASO 2] RECREAR CUERPO DE LAS FUNCIONES (Lógica Actualizada)
-- Ahora son SECURITY INVOKER para cumplir con el Advisor.
-- Nota: Requieren que las tablas master_users y user_roles_plain tengan RLS habilitado.

CREATE OR REPLACE FUNCTION public.get_my_organization_id() 
RETURNS UUID SECURITY INVOKER SET search_path = public AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS TEXT SECURITY INVOKER SET search_path = public AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY INVOKER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_system_master(p_email TEXT)
RETURNS BOOLEAN SECURITY INVOKER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = LOWER(TRIM(p_email)) AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY INVOKER SET search_path = public AS $$
    SELECT public.is_system_master();
$$ LANGUAGE sql STABLE;

-- [PASO 3] CONFIGURACIÓN DE TABLAS PARA INVOKER (RLS)
-- Esto permite que las funciones anteriores funcionen sin SECURITY DEFINER.
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles_plain ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own master status" ON public.master_users;
CREATE POLICY "Users can read own master status" ON public.master_users 
FOR SELECT TO authenticated 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can read own role plain" ON public.user_roles_plain;
CREATE POLICY "Users can read own role plain" ON public.user_roles_plain 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

GRANT SELECT ON public.master_users TO authenticated;
GRANT SELECT ON public.user_roles_plain TO authenticated;

-- [PASO 4] RECONSTRUIR VISTA UNIFICADA (Advisor Compliance)
ALTER VIEW public.unified_contacts SET (security_invoker = true);

-- [PASO 5] LIMPIEZA MASIVA DE SEARCH PATH (Para las otras 47 funciones)
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT n.nspname as schema, p.proname as name, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public'
    LOOP
        EXECUTE 'ALTER FUNCTION public.' || quote_ident(func_record.name) || '(' || func_record.args || ') SET search_path = public;';
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
