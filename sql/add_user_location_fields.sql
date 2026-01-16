-- Add state and region to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS region text;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
