-- Script para configurar las Zonas Operativas (Aragua y Carabobo)
-- CORREGIDO: Usamos WHERE NOT EXISTS en lugar de ON CONFLICT para evitar el error 42P10
-- si la columna 'name' no tiene restricción UNIQUE.
DO $$ BEGIN -- 1. Insertar Zonas para Aragua si no existen
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Aragua - Norte'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Aragua - Norte', 'Aragua', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Aragua - Sur'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Aragua - Sur', 'Aragua', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Aragua - Este'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Aragua - Este', 'Aragua', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Aragua - Oeste'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Aragua - Oeste', 'Aragua', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Aragua - Centro'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Aragua - Centro', 'Aragua', 'Central');
END IF;
-- 2. Insertar Zonas para Carabobo si no existen
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Carabobo - Norte'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Carabobo - Norte', 'Carabobo', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Carabobo - Sur'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Carabobo - Sur', 'Carabobo', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Valencia - Centro'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Valencia - Centro', 'Carabobo', 'Central');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM public.zones
    WHERE name = 'Puerto Cabello'
) THEN
INSERT INTO public.zones (name, state, region)
VALUES ('Puerto Cabello', 'Carabobo', 'Central');
END IF;
RAISE NOTICE 'Verificación e inserción de zonas completada.';
-- 3. Asignar zona por defecto a los representantes actuales sin zona
DECLARE default_zone_id UUID;
BEGIN
SELECT id INTO default_zone_id
FROM public.zones
WHERE name = 'Aragua - Centro'
LIMIT 1;
IF default_zone_id IS NOT NULL THEN
UPDATE public.user_roles
SET zone_id = default_zone_id
WHERE (
        state = 'Aragua'
        OR state IS NULL
    )
    AND zone_id IS NULL
    AND role IN ('representative', 'supervisor');
RAISE NOTICE 'Se asignó la zona Aragua - Centro a los usuarios sin zona.';
END IF;
END;
RAISE NOTICE 'Proceso completado exitosamente.';
END $$;