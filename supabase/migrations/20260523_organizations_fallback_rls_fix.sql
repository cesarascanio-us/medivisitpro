-- ========================================================================
-- ORGANIZATIONS FALLBACK RLS FIX - MEDIVISITPRO
-- Fecha: 2026-05-23
-- Objetivo: Permitir que todos los usuarios autenticados consulten (SELECT)
-- la organización Master (Tenant 0) para heredar el tema visual global,
-- manteniendo aislamiento completo para escrituras y otras organizaciones.
-- ========================================================================

-- 1. Eliminar políticas antiguas para evitar colisiones
DROP POLICY IF EXISTS "Master_God_Mode_Orgs" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Master full management organizations" ON public.organizations;
DROP POLICY IF EXISTS "Orgs_Select_Policy" ON public.organizations;
DROP POLICY IF EXISTS "Orgs_Modify_Policy" ON public.organizations;

-- 2. Política de Lectura (SELECT): Permite leer su propia organización o la organización Master
CREATE POLICY "Orgs_Select_Policy" ON public.organizations 
FOR SELECT TO authenticated 
USING (
    public.is_system_master() OR 
    id = public.get_my_organization_id() OR
    id = '00000000-0000-0000-0000-000000000000'
);

-- 3. Política de Modificación (ALL): Restringido a is_system_master o su propia organización
CREATE POLICY "Orgs_Modify_Policy" ON public.organizations 
FOR ALL TO authenticated 
USING (
    public.is_system_master() OR 
    id = public.get_my_organization_id()
)
WITH CHECK (
    public.is_system_master() OR 
    id = public.get_my_organization_id()
);

-- 4. Notificar a PostgREST para recargar el esquema
NOTIFY pgrst, 'reload schema';
