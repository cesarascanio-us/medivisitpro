-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migración: Configuración de Empresa Madre (MediSalud Pro) y Roles SaaS
-- Descripción: Establece la identidad fiscal de la plataforma y los roles del staff interno.
BEGIN;
-- 1. Mejorar tabla de organizaciones
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS fiscal_name TEXT,
    ADD COLUMN IF NOT EXISTS is_system_owner BOOLEAN DEFAULT false;
-- 2. Crear la Organización Madre (MediSalud Pro)
-- Usamos un ID fijo o genérico para identificación rápida si es necesario, 
-- pero el flag is_system_owner es la fuente de verdad.
INSERT INTO public.organizations (
        id,
        name,
        fiscal_name,
        slug,
        rif,
        fiscal_address,
        is_system_owner,
        plan_tier,
        subscription_status
    )
VALUES (
        '00000000-0000-0000-0000-000000000000',
        'MediSalud Pro',
        'Cesar Ascanio',
        'medisalud-pro',
        'V121420208',
        'Maracay, Edo. Aragua',
        true,
        'enterprise',
        'active'
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    fiscal_name = EXCLUDED.fiscal_name,
    rif = EXCLUDED.rif,
    fiscal_address = EXCLUDED.fiscal_address,
    is_system_owner = true;
-- 3. Actualizar Roles del Sistema (SaaS Staff)
-- Primero eliminamos el constraint antiguo para poder actualizar la lista de roles permitidos
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check CHECK (
        role = ANY (
            ARRAY [
    'master'::text, 
    'admin'::text, 
    'manager'::text, 
    'chief'::text, 
    'coordinator'::text, 
    'supervisor'::text, 
    'telemarketing'::text, 
    'representative'::text, 
    'doctor'::text, 
    'pharmacist'::text, 
    'service_chief'::text,
    'admin_saas'::text,      -- Gestión administrativa global
    'soporte_saas'::text,    -- Resolución de tickets
    'desarrollo_saas'::text  -- Debugging y mantenimiento
]
        )
    );
-- 4. Vincular al usuario Master a la Empresa Madre
-- Buscamos el registro de Cesar Ascanio (basado en el correo ya fortificado en el código)
UPDATE public.profiles
SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE email = 'cesar.ascanio@gmail.com';
UPDATE public.user_roles
SET organization_id = '00000000-0000-0000-0000-000000000000',
    role = 'master'
WHERE user_id IN (
        SELECT user_id
        FROM public.profiles
        WHERE email = 'cesar.ascanio@gmail.com'
    );
COMMIT;