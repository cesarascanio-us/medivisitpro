-- Script para corregir nombres vacíos o 'EMPTY' en perfiles
-- Se asignan nombres derivados del correo electrónico para mejorar la visualización.
-- 1. Actualizar nombres para el usuario Master (cesar.ascanio@gmail.com)
UPDATE public.profiles
SET first_name = 'César',
    last_name = 'Ascanio'
WHERE email = 'cesar.ascanio@gmail.com';
-- 2. Actualizar nombres para otros correos conocidos (Mercadeo)
UPDATE public.profiles
SET first_name = 'Mercadeo',
    last_name = 'Ventas'
WHERE email LIKE 'mercadeoyventa%';
-- 3. Actualizar nombres para Gerencia
UPDATE public.profiles
SET first_name = 'Gerencia',
    last_name = 'SSST'
WHERE email LIKE 'gerenciassst%';
-- 4. Para cualquier otro usuario con nombre 'EMPTY' o NULL, intentar extraer del email
-- Ejemplo: juan.perez@gmail.com -> Juan Perez
UPDATE public.profiles
SET first_name = INITCAP(SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 1)),
    last_name = INITCAP(SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 2))
WHERE (
        first_name IS NULL
        OR first_name = ''
        OR first_name = 'EMPTY'
    )
    AND email IS NOT NULL
    AND email LIKE '%_@_%';
-- 5. Limpieza final: Si last_name quedó vacío (emails sin punto), poner un punto o cargo genérico
UPDATE public.profiles
SET last_name = 'Usuario'
WHERE (
        last_name IS NULL
        OR last_name = ''
    )
    AND (
        first_name IS NOT NULL
        AND first_name != ''
    );
-- Confirmación
DO $$ BEGIN RAISE NOTICE 'Nombres de perfiles corregidos correctamente.';
END $$;