-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

DO $$
DECLARE fixed_count INT := 0;
demo_org_id UUID := 'd3300000-0000-0000-0000-000000000001';
demo_user_id UUID;
BEGIN -- Obtenemos el ID del usuario demo para asignar registros huérfanos de usuario
SELECT id INTO demo_user_id
FROM auth.users
WHERE email = 'demo.medivisitpro@gmail.com'
LIMIT 1;
-- 1. Asignar organización a médicos que no la tienen
UPDATE public.doctors
SET organization_id = demo_org_id
WHERE organization_id IS NULL;
GET DIAGNOSTICS fixed_count = ROW_COUNT;
RAISE NOTICE 'Se asignó organización a % médicos huérfanos.',
fixed_count;
-- 2. Asignar usuario a médicos que no lo tienen (si existen)
IF demo_user_id IS NOT NULL THEN
UPDATE public.doctors
SET user_id = demo_user_id
WHERE user_id IS NULL;
END IF;
-- 3. Asegurar que los médicos migrados sean visibles (status = Activo)
UPDATE public.doctors
SET status = 'Activo'
WHERE status IS NULL;
-- 4. Reparar farmacias si tuvieran el mismo problema
UPDATE public.pharmacies
SET organization_id = demo_org_id
WHERE organization_id IS NULL;
END $$;