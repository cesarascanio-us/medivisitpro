-- ========================================================================
-- DATABASE MIGRATION: FIX PHARMACIES AND REPRESENTATIVE ORGANIZATION SCAPE
-- ========================================================================

-- 1. Sync user_roles_plain cache with the source of truth user_roles table
-- This fixes the issue where the representative (cesarascanio.edu@gmail.com)
-- was mapped to Demo Medical Corp (8abd90e7-693a-41d6-85f5-9888c6df817f) in the plain cache
-- but belonged to BIOFARCO (a0000000-0000-0000-0000-000000000001) in user_roles.
UPDATE public.user_roles_plain urp
SET 
    organization_id = ur.organization_id,
    role = ur.role,
    state = ur.state,
    region = ur.region,
    zone_id = ur.zone_id
FROM public.user_roles ur
WHERE urp.user_id = ur.user_id;

-- 2. Move pharmacies that were incorrectly assigned to Demo Medical Corp (8abd90e7-693a-41d6-85f5-9888c6df817f)
-- by the representative (user_id: 45bf7587-4919-40d6-9230-0d3a0c8328e0) back to BIOFARCO (a0000000-0000-0000-0000-000000000001).
UPDATE public.pharmacies
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid
WHERE organization_id = '8abd90e7-693a-41d6-85f5-9888c6df817f'::uuid
  AND user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0'::uuid;

-- 3. Reload cache/PostgREST config
NOTIFY pgrst, 'reload schema';
