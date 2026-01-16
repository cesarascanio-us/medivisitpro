-- Fix 'visits' schema deficiencies - Corrected Version
-- Profiles table already exists, do NOT recreate it.

-- 1. Add missing 'directory_item_id' column (required by visitService)
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS directory_item_id UUID;

-- 2. Ensure 'directory_items' table exists (stub if missing)
CREATE TABLE IF NOT EXISTS public.directory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    address TEXT,
    entity_type TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Drop any existing broken FK and recreate pointing to profiles.user_id
-- NOTE: PostgREST joins require the FK constraint name to match the expected pattern
-- Visits.tsx uses: profiles!visits_user_id_fkey
-- This means FK must be named 'visits_user_id_fkey' and reference profiles

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_user_id_fkey;

-- PostgREST expects FK on (user_id) -> profiles where profiles has matching user_id
-- BUT profiles.user_id is NOT the PK. The PK is profiles.id.
-- So we CANNOT create FK user_id -> profiles(user_id) directly.
-- Solution: The query in Visits.tsx must be fixed OR we create a unique index on profiles(user_id)

-- Create a unique index on profiles.user_id to allow FK reference
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON public.profiles(user_id);

-- Now add FK constraint
DO $$ BEGIN
    ALTER TABLE public.visits 
    ADD CONSTRAINT visits_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Could not add visits_user_id_fkey: %', SQLERRM;
END $$;

-- 4. Add Constraint for directory_item_id
DO $$ BEGIN
    ALTER TABLE public.visits 
    ADD CONSTRAINT visits_directory_item_id_fkey
    FOREIGN KEY (directory_item_id) REFERENCES public.directory_items(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
