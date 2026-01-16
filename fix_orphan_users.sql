-- Script de Diagnóstico y Reparación de Usuarios Huérfanos
-- 1. Intentar crear perfiles para todos los roles que no tengan perfil
-- Usamos 'ON CONFLICT' para no fallar si ya existe
INSERT INTO public.profiles (user_id, email, first_name, last_name)
SELECT ur.user_id,
    COALESCE(au.email, 'usuario_huerfano@sistema.local'),
    -- Si no hay usuario auth, poner placeholder
    'Usuario',
    'Sin Perfil'
FROM public.user_roles ur
    LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE NOT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = ur.user_id
    );
-- 2. Intentar actualizar emails nuevamente para los que muestren "Sin email" o nulo
UPDATE public.profiles
SET email = au.email
FROM auth.users au
WHERE public.profiles.user_id = au.id
    AND (
        public.profiles.email IS NULL
        OR public.profiles.email = ''
        OR public.profiles.email = 'Sin email'
    );
-- 3. Verificación (esto mostrará un mensaje en la salida del script)
DO $$
DECLARE orphans_count INTEGER;
BEGIN
SELECT COUNT(*) INTO orphans_count
FROM public.user_roles ur
WHERE NOT EXISTS (
        SELECT 1
        FROM auth.users au
        WHERE au.id = ur.user_id
    );
IF orphans_count > 0 THEN RAISE NOTICE 'ALERTA: Se detectaron % usuarios en roles que NO existen en el sistema de autenticación (Auth).',
orphans_count;
ELSE RAISE NOTICE 'Todos los usuarios tienen su cuenta de autenticación correcta.';
END IF;
END $$;