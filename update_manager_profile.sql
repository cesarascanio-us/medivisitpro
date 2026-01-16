-- Update the profile for the manager user
UPDATE public.profiles
SET first_name = 'César',
    last_name = 'Ascanio'
WHERE email = 'cesarascanio.edu@gmail.com';
-- Verify the update
SELECT *
FROM public.profiles
WHERE email = 'cesarascanio.edu@gmail.com';