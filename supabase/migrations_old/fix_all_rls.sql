-- FIX ALL RLS ISSUES (Products & Contacts)
-- 1. PRODUCTS: Allow viewing by ORGANIZATION_ID (So Reps can see products created by Managers)
DROP POLICY IF EXISTS "Users can view own and global products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
-- Cleanup old
CREATE POLICY "View products by organization" ON public.products FOR
SELECT USING (
        organization_id = (
            SELECT organization_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
        OR user_id = auth.uid()
        OR organization_id IS NULL -- Global products
    );
-- 2. CONTACTS: Strict Ownership (Only see what you own)
-- As requested: "El usuario representante solo ve y gestiona SUS datos"
DROP POLICY IF EXISTS "RBAC Contact Select" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Insert" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Update" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Delete" ON public.contacts;
DROP POLICY IF EXISTS "Users view own or organization data based on role" ON public.contacts;
CREATE POLICY "Strict View Own Contacts" ON public.contacts FOR
SELECT USING (
        user_id = auth.uid()
        OR -- Allow Admins/Managers to see everything in their Org?
        (
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