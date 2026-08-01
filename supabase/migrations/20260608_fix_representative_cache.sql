-- ========================================================================
-- DATABASE MIGRATION: FIX REPRESENTATIVE CACHE AND RLS ALIGNMENT
-- ========================================================================

-- 1. Sync the user_roles_plain cache for the representative (cesarascanio.edu@gmail.com)
-- This fixes the organization_id alignment from Demo Medical Corp to BIOFARCO.
UPDATE public.user_roles_plain
SET 
    organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid,
    zone_id = '7d3206b0-0de0-4643-a9fa-d08aa3217577'::uuid,
    state = 'Aragua',
    region = 'Central',
    updated_at = now()
WHERE user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0'::uuid;

-- 2. Ensure all pharmacies, drugstores, doctors and other contacts created by this user
-- are correctly associated with BIOFARCO organization so they are visible under RLS.
UPDATE public.pharmacies
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0'::uuid;

UPDATE public.drugstores
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0'::uuid;

UPDATE public.doctors
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0'::uuid;

UPDATE public.health_centers
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0'::uuid;

-- 3. Reload schema cache for changes to take effect immediately
NOTIFY pgrst, 'reload schema';
