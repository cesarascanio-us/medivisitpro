-- =============================================
-- MediVisitPro - Seed Data & Fix Permissions
-- 1. Adds sample coordinates to contacts
-- 2. Ensures your user has full visibility
-- =============================================

BEGIN;

-- 1. ASSIGN SAMPLE COORDINATES
-- If there are 0 contacts with coords, the map will ALWAYS be empty.
-- We assign random points around Caracas for testing.
UPDATE public.contacts
SET 
    latitude = 10.4806 + (random() * 0.1 - 0.05),
    longitude = -66.9036 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL OR longitude IS NULL;

-- 2. ENSURE MASTER ROLE
-- This forces your user to have 'master' role in both tables.
-- We use your email to find your ID.
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'cesar.ascanio@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
        -- Insert/Update in main table
        INSERT INTO public.user_roles (user_id, role, company_id, is_active)
        VALUES (target_user_id, 'master', (SELECT id FROM public.companies LIMIT 1), true)
        ON CONFLICT (user_id) DO UPDATE SET role = 'master';
        
        -- Insert/Update in plain table
        INSERT INTO public.user_roles_plain (user_id, role, company_id)
        VALUES (target_user_id, 'master', (SELECT id FROM public.companies LIMIT 1))
        ON CONFLICT (user_id) DO UPDATE SET role = 'master';
    END IF;
END $$;

-- 3. FINAL VERIFICATION QUERY
SELECT 'Contacts with Coords' as info, count(*)::text as value FROM public.contacts WHERE latitude IS NOT NULL
UNION ALL
SELECT 'My Effective Role' as info, role FROM public.user_roles_plain WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cesar.ascanio@gmail.com');

COMMIT;

-- 4. REFRESH
NOTIFY pgrst, 'reload config';
