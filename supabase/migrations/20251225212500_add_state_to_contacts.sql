-- Add 'state' column to contacts table for regional filtering
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS state TEXT;

-- Update RLS or constraints if necessary (usually unrelated to adding a column)
-- Optional: Update existing contacts to have a default state if known, or leave NULL.
