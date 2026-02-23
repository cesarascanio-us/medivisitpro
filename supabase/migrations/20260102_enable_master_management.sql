-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- ENABLE MASTER & ADMIN USER MANAGEMENT
-- Date: 2026-01-02
-- Purpose:
-- 1. Grant 'master' role access to ALL data regardless of organization
-- 2. Grant 'admin' role management within their own organization
-- 3. Fix Master user isolation (when organization_id is NULL)
-- =====================================================

-- [PHASE 1: UPDATE POLICIES FOR PROFILES]
-- We replace the restrictive policies with role-aware versions.
-- Note: We use user_roles_plain to avoid recursion in the policies.

DROP POLICY IF EXISTS "Global Profile Access" ON public.profiles;
CREATE POLICY "Global Profile Access" ON public.profiles 
FOR ALL USING (
    user_id = auth.uid() OR -- You can always manage yourself
    (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid()) = 'master' OR -- Master sees all
    (
        (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid()) = 'admin' AND 
        organization_id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
    ) OR
    -- Fallback for cross-references in the same organization for non-admins
    organization_id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
);

-- [PHASE 2: UPDATE POLICIES FOR USER_ROLES]
DROP POLICY IF EXISTS "Global Role Access" ON public.user_roles;
CREATE POLICY "Global Role Access" ON public.user_roles 
FOR ALL USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid()) = 'master' OR
    (
        (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid()) = 'admin' AND 
        organization_id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
    ) OR
    organization_id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
);

-- [PHASE 3: ORGANIZATION POLICIES]
-- Ensure Master can see all organizations to manage them
DROP POLICY IF EXISTS "Organizations isolation" ON public.organizations;
CREATE POLICY "Organizations isolation" ON public.organizations 
FOR ALL USING (
    (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid()) = 'master' OR
    id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
);

-- [PHASE 4: ENSURE MASTER IS ROLE-TYPED]
-- In case the master user doesn't have a plain role record
INSERT INTO public.user_roles_plain (user_id, role, organization_id)
SELECT user_id, role, organization_id FROM public.user_roles
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

RAISE NOTICE 'Master and Admin management policies updated.';
