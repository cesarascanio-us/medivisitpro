-- Add missing fields for Pharmacies, Commerces, and Natural Stores
DO $$ BEGIN
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS rif TEXT;
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS potential TEXT;
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Activo';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
