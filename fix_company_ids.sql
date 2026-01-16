-- Script para asignar Company ID y evitar bloqueos por RLS
-- Asigna la empresa 'Biofarco' (o la crea) a todos los perfiles y contactos que no tengan empresa asignada.
DO $$
DECLARE target_company_id UUID;
BEGIN -- 1. Obtener o Crear la empresa principal 'Biofarco'
SELECT id INTO target_company_id
FROM public.companies
WHERE slug = 'biofarco'
LIMIT 1;
IF target_company_id IS NULL THEN -- Si no existe, buscar CUALQUIER empresa
SELECT id INTO target_company_id
FROM public.companies
LIMIT 1;
-- Si aun no existe, CREARLA
IF target_company_id IS NULL THEN
INSERT INTO public.companies (name, slug)
VALUES ('Biofarco', 'biofarco')
RETURNING id INTO target_company_id;
RAISE NOTICE 'Se creó la empresa Biofarco con ID: %',
target_company_id;
END IF;
END IF;
RAISE NOTICE 'Usando Company ID: %',
target_company_id;
-- 2. Actualizar perfiles (profiles) sin company_id
UPDATE public.profiles
SET company_id = target_company_id
WHERE company_id IS NULL;
-- 3. Actualizar contactos (contacts) sin company_id
UPDATE public.contacts
SET company_id = target_company_id
WHERE company_id IS NULL;
-- 4. Actualizar user_roles (si tiene la columna company_id, que suele tenerla)
-- Lo hacemos en un bloque separado por si la columna no existe en algún entorno
BEGIN
UPDATE public.user_roles
SET company_id = target_company_id
WHERE company_id IS NULL;
EXCEPTION
WHEN undefined_column THEN RAISE NOTICE 'La tabla user_roles no tiene company_id, saltando...';
END;
RAISE NOTICE 'Corrección de Company IDs completada exitosamente.';
END $$;