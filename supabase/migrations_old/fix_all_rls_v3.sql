-- FIX: Drop ALL conflicting policies on products and rep_inventory to cure 400 Bad Request
-- The previous script missed some policies because they had different names.
-- 1. CLEANUP PRODUCTS (Drop EVERYTHING)
DROP POLICY IF EXISTS "Blindaje_Isolation_Products" ON public.products;
DROP POLICY IF EXISTS "Org Products Access" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can view products from their organization" ON public.products;
DROP POLICY IF EXISTS "View products by organization" ON public.products;
DROP POLICY IF EXISTS "tenant_isolation" ON public.products;
DROP POLICY IF EXISTS "Users can view own and global products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
-- 2. APPLY SINGLE CLEAN POLICY FOR PRODUCTS
CREATE POLICY "Unified Product Access" ON public.products FOR
SELECT USING (
        organization_id = (
            SELECT organization_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
        OR user_id = auth.uid()
        OR organization_id IS NULL
    );
-- 3. CLEANUP REP_INVENTORY (Just in case)
DROP POLICY IF EXISTS "Users can view own inventory" ON public.rep_inventory;
DROP POLICY IF EXISTS "Read access auth_ri" ON public.rep_inventory;
DROP POLICY IF EXISTS "Full access admin_ri" ON public.rep_inventory;
-- 4. APPLY REP_INVENTORY POLICY
CREATE POLICY "Unified Rep Inventory Access" ON public.rep_inventory FOR
SELECT USING (
        user_id = auth.uid()
        OR (
            SELECT role
            FROM public.user_roles
            WHERE user_id = auth.uid()
        ) IN ('admin', 'manager', 'master')
    );
-- 5. RE-APPLY CONTACTS STRICT POLICY (Confirming it's there)
DROP POLICY IF EXISTS "RBAC Contact Select" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Insert" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Update" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Delete" ON public.contacts;
DROP POLICY IF EXISTS "Users view own or organization data based on role" ON public.contacts;
DROP POLICY IF EXISTS "Strict View Own Contacts" ON public.contacts;
DROP POLICY IF EXISTS "Strict Manage Own Contacts" ON public.contacts;
CREATE POLICY "Strict View Own Contacts" ON public.contacts FOR
SELECT USING (
        user_id = auth.uid()
        OR (
            (
                SELECT role
                FROM public.user_roles
                WHERE user_id = auth.uid()
            ) IN ('admin', 'manager', 'master')
            AND organization_id = (
                SELECT organization_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
        )
    );
CREATE POLICY "Strict Manage Own Contacts" ON public.contacts FOR ALL USING (user_id = auth.uid());