-- Migration: Add extra commercial/training columns to products table
-- Supports detailed Intelligence 360 mapping during product setup.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS selling_points JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS profitability_info TEXT,
    ADD COLUMN IF NOT EXISTS sales_tips TEXT,
    ADD COLUMN IF NOT EXISTS objection_handling TEXT;