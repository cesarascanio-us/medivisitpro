-- Add category column which was missing
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS category text;

-- Optional: Drop priority constraint if it is too restrictive, or just rely on frontend to send correct values.
-- For now, we keep the constraint as it enforces good data quality, allowing 'low', 'medium', 'high', 'critical'.
