-- MediVisitPro - Geographical Data Repair for Zones
-- Purpose: Fix missing region/state data in zones to enable filtering in User Management.
-- Date: 2026-02-18
-- 1. Ensure columns exist (Safeguard)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'zones'
        AND column_name = 'region'
) THEN
ALTER TABLE public.zones
ADD COLUMN region TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'zones'
        AND column_name = 'state'
) THEN
ALTER TABLE public.zones
ADD COLUMN state TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'zones'
        AND column_name = 'organization_id'
) THEN
ALTER TABLE public.zones
ADD COLUMN organization_id UUID REFERENCES organizations(id);
END IF;
END $$;
-- 2. Repair existing data based on common names
UPDATE public.zones
SET state = 'Aragua',
    region = 'Central'
WHERE name ILIKE '%Maracay%'
    AND state IS NULL;
UPDATE public.zones
SET state = 'Carabobo',
    region = 'Central'
WHERE name ILIKE '%Valencia%'
    AND state IS NULL;
UPDATE public.zones
SET state = 'Distrito Capital',
    region = 'Capital'
WHERE name ILIKE '%Caracas%'
    AND state IS NULL;
UPDATE public.zones
SET state = 'Zulia',
    region = 'Occidental'
WHERE name ILIKE '%Maracaibo%'
    AND state IS NULL;
UPDATE public.zones
SET state = 'Lara',
    region = 'Occidental'
WHERE name ILIKE '%Barquisimeto%'
    AND state IS NULL;
-- 3. Assign orphaned zones to the first discovered organization (Biofarco or similar)
-- This ensures regular admins can see the default zones.
UPDATE public.zones
SET organization_id = (
        SELECT id
        FROM organizations
        LIMIT 1
    )
WHERE organization_id IS NULL;
-- 4. Notify PostgREST to reload schema
NOTIFY pgrst,
'reload schema';