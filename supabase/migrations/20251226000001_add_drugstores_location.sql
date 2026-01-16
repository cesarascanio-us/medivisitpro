-- Add missing 'location' column to drugstores table if it doesn't exist
-- Run this in Supabase SQL Editor

ALTER TABLE drugstores ADD COLUMN IF NOT EXISTS location TEXT;
