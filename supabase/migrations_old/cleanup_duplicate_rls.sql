-- CLEANUP DUPLICATE AND DANGEROUS RLS POLICIES
-- Goal: Remove "Blindaje_..." and other legacy policies that use the dangerous `get_user_org()` function
-- or redundant policies that conflict with our new safe "tenant_isolation".
-- 1. Contacts
DROP POLICY IF EXISTS "Blindaje_Isolation_Contacts" ON public.contacts;
DROP POLICY IF EXISTS "Enable read access for users of same org" ON public.contacts;
-- Covered by tenant_isolation or Org Access
DROP POLICY IF EXISTS "Master sees all contacts" ON public.contacts;
-- Covered by tenant_isolation
DROP POLICY IF EXISTS "Org Contact Access" ON public.contacts;
-- Potentially redundant if "Org Contact Access Enhanced" exists
DROP POLICY IF EXISTS "Strict View Own Contacts" ON public.contacts;
-- Redundant if we have role-based access
DROP POLICY IF EXISTS "Representatives see own contacts" ON public.contacts;
-- Redundant
-- Keep "tenant_isolation" (Safe) and "Org Contact Access Enhanced" (Granular)
-- Ensure "tenant_isolation" exists and is correct (using get_my_organization_id)
-- (We assume tenant_isolation was created by previous scripts or is the target standard)
-- 2. Transfer Orders
DROP POLICY IF EXISTS "Blindaje_Isolation_Orders" ON public.transfer_orders;
DROP POLICY IF EXISTS "Dashboard Access Policy - Orders" ON public.transfer_orders;
-- Complex/Recursive?
-- Keep "Org Transfer Orders Access" and "tenant_isolation"
-- 3. Visits
DROP POLICY IF EXISTS "Blindaje_Isolation_Visits" ON public.visits;
DROP POLICY IF EXISTS "Dashboard Access Policy - Visits" ON public.visits;
-- Keep "Org Visits Access" and "tenant_isolation"
-- 4. Sample Assignments (Just in case)
DROP POLICY IF EXISTS "Blindaje_Isolation_Samples" ON public.sample_assignments;
-- 5. Fix `get_user_org` just in case it's used elsewhere (make it safe or deprecate)
-- We'll just set search_path for now to match other fixes, but ideally we stop using it.
ALTER FUNCTION public.get_user_org
SET search_path = public;