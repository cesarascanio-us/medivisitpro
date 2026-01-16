-- FINAL STEP: Confirm the new user manually
-- The 500 Error is gone! Now we just need to bypass email verification.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'cesarascaniofo.us@gmail.com';

-- Also ensure the role is set correctly (just in case the frontend logic missed it due to race condition)
-- We'll just upsert it to be safe.
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'supervisor', true
FROM auth.users
WHERE email = 'cesarascaniofo.us@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'supervisor', is_active = true;

-- Reload config just to be pristine
NOTIFY pgrst, 'reload config';
