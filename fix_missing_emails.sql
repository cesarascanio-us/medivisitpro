-- Script para sincronizar correos electrónicos desde auth.users a public.profiles
-- Esto soluciona el problema de "Sin email" en la lista de usuarios.
-- 1. Actualizar correos existentes que estén vacíos o nulos
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.user_id = auth.users.id
    AND (
        public.profiles.email IS NULL
        OR public.profiles.email = ''
    );
-- 2. Asegurar que el email coincida siempre con el de autenticación (opcional pero recomendado)
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.user_id = auth.users.id
    AND public.profiles.email != auth.users.email;
-- 3. Insertar perfiles faltantes si existen usuarios en auth.users que no tienen perfil en public.profiles
-- (Esto puede ocurrir si el trigger falló en la creación o si se crearon manualmente)
INSERT INTO public.profiles (user_id, email, first_name, last_name)
SELECT au.id,
    au.email,
    NULL,
    -- first_name placeholder
    NULL -- last_name placeholder
FROM auth.users au
WHERE NOT EXISTS (
        SELECT 1
        FROM public.profiles pp
        WHERE pp.user_id = au.id
    );
-- 4. Notificar
DO $$ BEGIN RAISE NOTICE 'Sincronización de correos completada.';
END $$;