-- ========================================================================
-- SECURITY ADVISOR FIX - MEDIVISITPRO
-- Fecha: 2026-05-03
-- Objetivo: Resolver advertencias CRÍTICAS del Supabase Security Advisor
-- ========================================================================

-- 1. FIX: "RLS Disabled in Public - public.master_users"
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;

-- Opcional pero recomendado: Permitir que los usuarios vean si ellos mismos son master
DROP POLICY IF EXISTS "Users can view own master status" ON public.master_users;
CREATE POLICY "Users can view own master status" ON public.master_users 
FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 2. FIX: "RLS Disabled in Public - public.user_roles_plain"
ALTER TABLE public.user_roles_plain ENABLE ROW LEVEL SECURITY;

-- Permitir que cada usuario pueda leer exclusivamente su propia fila de caché
-- Esto NO causa recursión porque solo compara contra auth.uid() directamente
DROP POLICY IF EXISTS "Users can read own cached role" ON public.user_roles_plain;
CREATE POLICY "Users can read own cached role" ON public.user_roles_plain 
FOR SELECT USING (
    user_id = auth.uid()
);

-- NOTA: Las funciones get_my_role() y get_my_organization_id() son SECURITY DEFINER,
-- por lo que seguirán funcionando sin problemas aunque la tabla tenga RLS.

NOTIFY pgrst, 'reload schema';
