-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MANUAL CONFIRMATION & FIX
-- 1. Confirm all unconfirmed emails
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Reset password for the specific user experiencing issues (optional, but good for testing)
-- Setting password to: 12345678
UPDATE auth.users
SET encrypted_password = crypt('12345678', gen_salt('bf'))
WHERE email = 'cesarascaniofo.us@gmail.com';

-- 3. Ensure orphans have a role (Fallback to Supervisor)
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'supervisor', true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);

-- 4. Ensure orphans have a profile
INSERT INTO public.profiles (user_id, first_name, last_name, email)
SELECT id, 'Usuario', 'Temporal', email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);

-- 5. Reload Config
NOTIFY pgrst, 'reload config';
