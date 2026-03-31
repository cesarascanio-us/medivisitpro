-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ==============================================================================
-- FIX DE ACCESO DE MASTER (GOD MODE)
-- ==============================================================================
-- Fecha: 18/02/2026
-- Propósito: Garantizar que el usuario DEMO (y cualquier Master) vea TODA la data.
--            1. Asegura que el usuario tenga el rol 'master' en user_roles.
--            2. Aplica políticas RLS que permiten ver todo si is_master() es true.
-- ==============================================================================
DO $$
DECLARE v_user_email TEXT := 'demo@medivisitpro.com';
v_user_id UUID;
v_demo_org_id UUID;
BEGIN -- 1. OBTENER ID DEL USUARIO DEMO
SELECT id INTO v_user_id
FROM auth.users
WHERE email = v_user_email
LIMIT 1;
-- Si no hay usuario demo específico, intentar con el usuario actual (si se ejecuta desde SQL Editor)
IF v_user_id IS NULL THEN v_user_id := auth.uid();
END IF;
IF v_user_id IS NULL THEN RAISE NOTICE 'No se pudo identificar el usuario para otorgar rol Master.';
ELSE RAISE NOTICE 'Otorgando privilegios MASTER al usuario ID: %',
v_user_id;
-- 2. ASEGURAR ROL MASTER EN user_roles
-- Buscamos si ya tiene rol, si no, insertamos.
-- Nota: El rol 'master' suele ser independiente de la org, pero por compatibilidad con
-- el esquema actual que pide organization_id, buscamos la org demo.
SELECT id INTO v_demo_org_id
FROM organizations
WHERE slug = 'demo-medical-corp'
LIMIT 1;
IF v_demo_org_id IS NULL THEN -- Fallback a Biofarco si no existe la demo
SELECT id INTO v_demo_org_id
FROM organizations
WHERE slug = 'biofarco'
LIMIT 1;
END IF;
IF v_demo_org_id IS NOT NULL THEN
INSERT INTO user_roles (user_id, role, organization_id)
VALUES (v_user_id, 'master', v_demo_org_id) ON CONFLICT (user_id, organization_id) DO
UPDATE
SET role = 'master';
-- También insertar en la tabla plana si existe (optimización)
BEGIN
INSERT INTO user_roles_plain (user_id, role, organization_id)
VALUES (v_user_id, 'master', v_demo_org_id) ON CONFLICT (user_id) DO
UPDATE
SET role = 'master',
    organization_id = v_demo_org_id;
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Tabla user_roles_plain no existe o error al actualizar.';
END;
RAISE NOTICE 'Rol MASTER asignado a % en la org %',
v_user_email,
v_demo_org_id;
END IF;
END IF;
-- 3. APLICAR FUNCION HELPER is_master() (Si no existe)
CREATE OR REPLACE FUNCTION public.is_master() RETURNS BOOLEAN AS $func$
SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id::text = auth.uid()::text
            AND role = 'master'
    );
$func$ LANGUAGE sql STABLE SECURITY DEFINER;
-- 4. ACTUALIZAR POLITICAS DE SEGURIDAD (RLS) PARA MODULOS CLAVE
-- Permitir acceso si organization_id coincide O si es master.
-- Contacts
DROP POLICY IF EXISTS "Org Contact Access" ON public.contacts;
CREATE POLICY "Org Contact Access" ON public.contacts FOR ALL USING (
    organization_id = get_my_organization_id()
    OR public.is_master()
);
-- Doctors
DROP POLICY IF EXISTS "Org Doctors Access" ON public.doctors;
CREATE POLICY "Org Doctors Access" ON public.doctors FOR ALL USING (
    organization_id = get_my_organization_id()
    OR public.is_master()
);
-- Pharmacies
DROP POLICY IF EXISTS "Org Pharmacies Access" ON public.pharmacies;
CREATE POLICY "Org Pharmacies Access" ON public.pharmacies FOR ALL USING (
    organization_id = get_my_organization_id()
    OR public.is_master()
);
-- Doctor Schedules
DROP POLICY IF EXISTS "Org Schedules Access" ON public.doctor_schedules;
CREATE POLICY "Org Schedules Access" ON public.doctor_schedules FOR ALL USING (
    user_id = auth.uid()
    OR public.is_master()
    OR EXISTS (
        SELECT 1
        FROM contacts c
        WHERE c.id = doctor_schedules.doctor_id
            AND c.organization_id = get_my_organization_id()
    )
);
RAISE NOTICE 'Políticas RLS actualizadas para soportar el modo MASTER.';
END $$;