-- Add new columns for enhanced organization profile
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS rif TEXT,
ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS taxpayer_type TEXT;

-- Verify the columns were added
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'rif') THEN
        RAISE EXCEPTION 'Column rif was not created';
    END IF;
END $$;
