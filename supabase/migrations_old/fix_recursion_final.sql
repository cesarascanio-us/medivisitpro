-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- FIX INFINITE RECURSION IN RLS (Root Cause of 400 Bad Request)
-- AND FIX COLUMN DOES NOT EXIST ERROR (rep_inventory.organization_id)
-- 1. FIX USER_ROLES (The source of recursion)
DROP POLICY IF EXISTS "Blindaje_Isolation_Roles" ON public.user_roles;
DROP POLICY IF EXISTS "Org User Roles Access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "Safe View User Roles" ON public.user_roles;
CREATE POLICY "Safe View User Roles" ON public.user_roles FOR
SELECT USING (
        user_id = auth.uid()
        OR organization_id = get_my_organization_id() -- Uses auth_internal, safe.
    );
-- 2. FIX PROFILES (The bridge)
DROP POLICY IF EXISTS "Blindaje_Isolation_Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles org isolation" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Permitir editar profiles a Master y Admin" ON public.profiles;
DROP POLICY IF EXISTS "Safe View Profiles" ON public.profiles;
CREATE POLICY "Safe View Profiles" ON public.profiles FOR
SELECT USING (
        id = auth.uid()
        OR organization_id = get_my_organization_id() -- Uses auth_internal, safe.
    );
-- 3. FIX PRODUCTS (Ensure it's clean)
DROP POLICY IF EXISTS "Blindaje_Isolation_Products" ON public.products;
DROP POLICY IF EXISTS "Org Products Access" ON public.products;
DROP POLICY IF EXISTS "tenant_isolation" ON public.products;
DROP POLICY IF EXISTS "Unified Product Access" ON public.products;
DROP POLICY IF EXISTS "Safe View Products" ON public.products;
CREATE POLICY "Safe View Products" ON public.products FOR
SELECT USING (
        user_id = auth.uid()
        OR organization_id = get_my_organization_id() -- Uses auth_internal, safe.
        OR organization_id IS NULL
    );
-- 4. FIX REP_INVENTORY (Ensure it's clean)
-- Fixed: Removed organization_id reference which does not exist in rep_inventory table
DROP POLICY IF EXISTS "Users can view own inventory" ON public.rep_inventory;
DROP POLICY IF EXISTS "Read access auth_ri" ON public.rep_inventory;
DROP POLICY IF EXISTS "Full access admin_ri" ON public.rep_inventory;
DROP POLICY IF EXISTS "Unified Rep Inventory Access" ON public.rep_inventory;
DROP POLICY IF EXISTS "Safe View Inventory" ON public.rep_inventory;
CREATE POLICY "Safe View Inventory" ON public.rep_inventory FOR
SELECT USING (
        user_id = auth.uid() -- If we want Managers to see inventory, we need a join/exists, but let's keep it simple and safe for now to fix the error.
        -- Add manager access later via safe subquery if needed.
        -- OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager') 
    );