-- DEBUG: TEMPORARILY DISABLE COMPLEXITY TO FIND 400 ERROR SOURCE
-- 1. DISABLE RLS (Make everything public for a moment to see if error persists)
ALTER TABLE public.rep_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- 2. DROP POTENTIAL PROBLEMATIC TRIGGERS
DROP TRIGGER IF EXISTS audit_rep_inventory ON public.rep_inventory;
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
-- 3. ENSURE NO POLICIES INTERFERE (Even if RLS disabled, good to be clean)
DROP POLICY IF EXISTS "Safe View Inventory" ON public.rep_inventory;
DROP POLICY IF EXISTS "Safe View Products" ON public.products;
DROP POLICY IF EXISTS "Safe View User Roles" ON public.user_roles;
DROP POLICY IF EXISTS "Safe View Profiles" ON public.profiles;
-- NOTE: If this fixes the 400 error, we know it's RLS or Trigger related.
-- We will re-enable security step-by-step after confirmation.