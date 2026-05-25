-- Add signature_url to sample_movements if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.sample_movements ADD COLUMN IF NOT EXISTS signature_url TEXT;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
