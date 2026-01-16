-- DIAGNOSTIC FIX: Temporarily disable Security Policies
-- This helps us confirm if the 500 Error is caused by RLS Recursion.

-- 1. Reload PostgREST Cache (Fixes stale schema issues)
NOTIFY pgrst, 'reload config';

-- 2. Disable RLS on user_roles and profiles
-- If login works after this, we know the issue was the Policies.
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Ensure permissions are granted
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
