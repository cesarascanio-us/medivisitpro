-- Add missing columns to pharmacies table if they don't exist
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS sector text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS rif text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS schedule text;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS business_hours text;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload config';
