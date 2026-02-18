-- RESTAURAR ACCESO MASTER PARA CESAR ASCANIO
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase
-- 1. Crear la columna is_master si no existe (esto evita el error que viste)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'is_master'
) THEN
ALTER TABLE public.profiles
ADD COLUMN is_master BOOLEAN DEFAULT false;
END IF;
END $$;
-- 2. Asegurar que el usuario tiene el flag is_master en profiles
UPDATE public.profiles
SET is_master = true
WHERE email = 'cesar.ascanio@gmail.com';
-- 3. Restaurar el rol 'master' en la tabla de roles
-- Esto es lo que permite que el API de Supabase te devuelva todas las empresas (RLS)
INSERT INTO public.user_roles (user_id, role, is_active, organization_id)
SELECT id,
    'master',
    true,
    NULL
FROM auth.users
WHERE email = 'cesar.ascanio@gmail.com' ON CONFLICT (user_id) DO
UPDATE
SET role = 'master',
    is_active = true,
    organization_id = NULL;
-- 4. Verificar que el usuario ahora tiene permisos globales
SELECT u.email,
    ur.role
FROM auth.users u
    JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'cesar.ascanio@gmail.com';