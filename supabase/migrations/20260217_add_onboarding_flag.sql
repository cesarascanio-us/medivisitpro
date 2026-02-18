-- Migration: Add onboarding flag to profiles
-- Description: Adds a boolean flag to track if a user has completed the Strategic Onboarding 360.
-- Date: 2026-02-17
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;