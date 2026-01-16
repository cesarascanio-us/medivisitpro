-- Add missing 'type' column to health_centers if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'health_centers'
        AND column_name = 'type'
) THEN
ALTER TABLE public.health_centers
ADD COLUMN type TEXT;
END IF;
END $$;