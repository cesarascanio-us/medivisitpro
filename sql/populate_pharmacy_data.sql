-- Update existing pharmacies to have a state so filtering works
-- This is a temporary population to verify functionality

-- Update some to Aragua. Explicitly NOT setting region as it's not a column.
UPDATE public.pharmacies
SET state = 'Aragua'
WHERE state IS NULL;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
