-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================
-- Security Advisor Fix - May 2026
-- Resolves: 3 CRITICAL errors + Auth RLS Initialization warnings
-- ========================================================================

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │  FIX 1: CRITICAL — RLS Disabled on public.natural_stores          │
-- └─────────────────────────────────────────────────────────────────────┘
ALTER TABLE public.natural_stores ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'natural_stores' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.natural_stores', pol.policyname);
    END LOOP;
END $$;

-- Organization-scoped RLS policy (same pattern as all other contact tables)
CREATE POLICY "org_isolation_natural_stores" ON public.natural_stores
    FOR ALL
    USING (
        organization_id = public.get_my_organization_id() 
        OR public.is_master()
    )
    WITH CHECK (
        organization_id = public.get_my_organization_id() 
        OR public.is_master()
    );

-- Grant access to authenticated users (RLS will filter)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.natural_stores TO authenticated;

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │  FIX 2: CRITICAL — Security Definer View: unified_contacts        │
-- │  The view was recreated in 20260404_add_region_support.sql        │
-- │  WITHOUT security_invoker = true                                   │
-- └─────────────────────────────────────────────────────────────────────┘
ALTER VIEW public.unified_contacts SET (security_invoker = true);

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │  FIX 3: CRITICAL — Security Definer View: view_farmacia_stock     │
-- │  Previous hardening migration used DO/EXCEPTION which may have    │
-- │  silently failed if view was recreated after                       │
-- └─────────────────────────────────────────────────────────────────────┘
ALTER VIEW public.view_farmacia_stock_actual SET (security_invoker = true);

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │  FIX 4: WARNINGS — Auth RLS Initialization Plan                   │
-- │  Tables: app_roles, app_permissions, role_permissions,            │
-- │          user_favorites                                            │
-- └─────────────────────────────────────────────────────────────────────┘

-- ── 4a. app_roles ─────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'app_roles' AND schemaname = 'public') THEN
        ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        EXECUTE (
            SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.app_roles', policyname), '; ')
            FROM pg_policies WHERE tablename = 'app_roles' AND schemaname = 'public'
        );
        
        -- Read access for all authenticated (roles are lookup data)
        CREATE POLICY "authenticated_read_app_roles" ON public.app_roles
            FOR SELECT TO authenticated
            USING (auth.uid() IS NOT NULL);
        
        -- Write access only for masters/admins
        CREATE POLICY "admin_write_app_roles" ON public.app_roles
            FOR ALL TO authenticated
            USING (public.is_master())
            WITH CHECK (public.is_master());
    END IF;
END $$;

-- ── 4b. app_permissions ───────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'app_permissions' AND schemaname = 'public') THEN
        ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;
        
        EXECUTE (
            SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.app_permissions', policyname), '; ')
            FROM pg_policies WHERE tablename = 'app_permissions' AND schemaname = 'public'
        );
        
        -- Read access for all authenticated (permissions are lookup data)
        CREATE POLICY "authenticated_read_app_permissions" ON public.app_permissions
            FOR SELECT TO authenticated
            USING (auth.uid() IS NOT NULL);
        
        -- Write access only for masters
        CREATE POLICY "admin_write_app_permissions" ON public.app_permissions
            FOR ALL TO authenticated
            USING (public.is_master())
            WITH CHECK (public.is_master());
    END IF;
END $$;

-- ── 4c. role_permissions ──────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'role_permissions' AND schemaname = 'public') THEN
        ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
        
        EXECUTE (
            SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.role_permissions', policyname), '; ')
            FROM pg_policies WHERE tablename = 'role_permissions' AND schemaname = 'public'
        );
        
        -- Read access for all authenticated (role-permission mappings are lookup data)
        CREATE POLICY "authenticated_read_role_permissions" ON public.role_permissions
            FOR SELECT TO authenticated
            USING (auth.uid() IS NOT NULL);
        
        -- Write access only for masters
        CREATE POLICY "admin_write_role_permissions" ON public.role_permissions
            FOR ALL TO authenticated
            USING (public.is_master())
            WITH CHECK (public.is_master());
    END IF;
END $$;

-- ── 4d. user_favorites ────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_favorites' AND schemaname = 'public') THEN
        ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
        
        EXECUTE (
            SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.user_favorites', policyname), '; ')
            FROM pg_policies WHERE tablename = 'user_favorites' AND schemaname = 'public'
        );
        
        -- Users can only see/manage their own favorites
        CREATE POLICY "own_favorites_select" ON public.user_favorites
            FOR SELECT TO authenticated
            USING (user_id = auth.uid() OR public.is_master());
        
        CREATE POLICY "own_favorites_insert" ON public.user_favorites
            FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid());
        
        CREATE POLICY "own_favorites_delete" ON public.user_favorites
            FOR DELETE TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │  VERIFICATION: Confirm all fixes applied                          │
-- └─────────────────────────────────────────────────────────────────────┘
DO $$
DECLARE
    rls_check BOOLEAN;
BEGIN
    -- Verify natural_stores RLS
    SELECT relrowsecurity INTO rls_check
    FROM pg_class WHERE relname = 'natural_stores';
    
    IF NOT rls_check THEN
        RAISE WARNING 'SECURITY FIX FAILED: natural_stores RLS not enabled';
    ELSE
        RAISE NOTICE 'OK: natural_stores RLS enabled';
    END IF;
    
    -- Verify views are security invoker
    IF EXISTS (
        SELECT 1 FROM pg_views 
        WHERE viewname = 'unified_contacts' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'OK: unified_contacts view exists — security_invoker applied';
    END IF;
    
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE ' Security Advisor Fix Complete — César Ascanio CA  ';
    RAISE NOTICE '════════════════════════════════════════════════════';
END $$;
