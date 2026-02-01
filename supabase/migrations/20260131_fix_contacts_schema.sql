-- Migration: Fix missing organization_id in contacts and doctors
-- Date: 2026-01-31
-- 1. Fix DOCTORS table
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_doctors_organization ON public.doctors(organization_id);
-- 2. Fix CONTACTS table (Generic)
-- Checking if organization_id exists, adding if not.
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON public.contacts(organization_id);
-- 3. Fix PHARMACIES table (Just in case, though it looked ok)
ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_organization ON public.pharmacies(organization_id);
-- 4. Enable RLS or update policies if necessary
-- (Note: Ensure RLS policies on these tables correspond to organization_id check)