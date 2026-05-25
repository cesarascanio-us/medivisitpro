-- Add new contact types to ENUM
ALTER TYPE public.contact_type ADD VALUE IF NOT EXISTS 'commerce';
ALTER TYPE public.contact_type ADD VALUE IF NOT EXISTS 'natural_store';
