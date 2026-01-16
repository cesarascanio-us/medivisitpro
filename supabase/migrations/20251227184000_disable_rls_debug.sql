-- Temporarily disable RLS to diagnose 400 Bad Request errors
-- If this fixes the issue, the problem is definitely within the Policy/Function recursion logic.

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;

-- Also disable for others if suspected
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
