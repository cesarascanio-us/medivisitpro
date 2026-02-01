-- Migration: Fix missing columns (zone_id and organization_id) in contacts tables
-- Date: 2026-01-31
-- 1. Fix DOCTORS table (Add both missing columns)
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES zones(id),
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_doctors_zone ON public.doctors(zone_id);
CREATE INDEX IF NOT EXISTS idx_doctors_organization ON public.doctors(organization_id);
-- 2. Fix CONTACTS table (Generic)
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON public.contacts(organization_id);
-- 3. Fix PHARMACIES table
ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
-- Note: Pharmacies usually has zone_id, but good to check if needed, though typically it exists.
CREATE INDEX IF NOT EXISTS idx_pharmacies_organization ON public.pharmacies(organization_id);