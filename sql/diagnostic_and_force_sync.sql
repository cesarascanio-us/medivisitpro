-- =============================================
-- MediVisitPro - Diagnostic & Force Sync Focus
-- Use this to confirm why data isn't showing up
-- =============================================

-- 1. FORCE REFILL THE CACHE (Ensures data exists for RLS)
TRUNCATE public.user_roles_plain;

INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, state, region, updated_at)
SELECT user_id, role, zone_id, company_id, state, region, updated_at
FROM public.user_roles;

-- 2. SYNC REGION DATA TO CONTACTS (Optional but helpful for new logic)
-- If contacts have no region, supervisors might see nothing if they rely on region match.
-- Let's assume contacts inherit region from their zone or state if missing.
UPDATE public.contacts c
SET region = z.name -- Assuming zone name might be a region if state is not enough
FROM public.zones z
WHERE c.zone_id = z.id AND c.region IS NULL;

-- 3. DIAGNOSTIC QUERY
-- Look at the results of these to see if anything is missing
SELECT 'Current User ID' as info, auth.uid()::text as value
UNION ALL
SELECT 'My Role from Function' as info, public.get_my_role()
UNION ALL
SELECT 'Roles in Plain Table' as info, count(*)::text FROM public.user_roles_plain
UNION ALL
SELECT 'Contacts with Coords' as info, count(*)::text FROM public.contacts WHERE latitude IS NOT NULL;

-- 4. REFRESH PostgREST
NOTIFY pgrst, 'reload config';
