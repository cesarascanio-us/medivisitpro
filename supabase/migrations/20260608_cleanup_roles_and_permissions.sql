-- ========================================================================
-- DATABASE MIGRATION: CLEANUP & CONSOLIDATE APP ROLES & PERMISSIONS
-- ========================================================================

BEGIN;

-- 1. BACKFILL PERMISSIONS FROM ALIASES TO CANONICAL ROLES
-- We use DISTINCT ON (permission_code) to avoid duplicates inside the INSERT statement,
-- prioritizing 'full' access level over 'read_only'.

-- A. From 'gerente' to 'manager'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'manager'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug = 'gerente'
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- B. From 'jefe' to 'chief'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'chief'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug = 'jefe'
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- C. From 'coordinador' to 'coordinator'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'coordinator'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug = 'coordinador'
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- D. From representatives aliases to 'representative'
-- Alias slugs: 'commercial_rep', 'rep_comercial', 'rep_integral', 'integral_rep', 'visitador_medico', 'medical_visitor'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'representative'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug IN ('commercial_rep', 'rep_comercial', 'rep_integral', 'integral_rep', 'visitador_medico', 'medical_visitor')
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- E. From 'medico' to 'doctor'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'doctor'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug = 'medico'
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- F. From 'pharmacy' / 'farmacia' to 'pharmacist'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'pharmacist'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug IN ('pharmacy', 'farmacia')
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- G. From 'compras' to 'buyer'
INSERT INTO public.role_permissions (role_slug, permission_code, access_level)
SELECT DISTINCT ON (permission_code)
    'buyer'::text, permission_code, access_level
FROM public.role_permissions
WHERE role_slug = 'compras'
ORDER BY permission_code, (CASE WHEN access_level = 'full' THEN 1 ELSE 2 END)
ON CONFLICT (role_slug, permission_code) DO UPDATE SET
    access_level = EXCLUDED.access_level;

-- 2. MIGRATE USER ROLES OF ACTIVE USERS
-- Update user_roles and user_roles_plain to use the canonical slugs instead of the alias slugs.
UPDATE public.user_roles SET role = 'manager' WHERE role = 'gerente';
UPDATE public.user_roles SET role = 'chief' WHERE role = 'jefe';
UPDATE public.user_roles SET role = 'coordinator' WHERE role = 'coordinador';
UPDATE public.user_roles SET role = 'representative' WHERE role IN ('commercial_rep', 'rep_comercial', 'rep_integral', 'integral_rep', 'visitador_medico', 'medical_visitor');
UPDATE public.user_roles SET role = 'doctor' WHERE role = 'medico';
UPDATE public.user_roles SET role = 'pharmacist' WHERE role IN ('pharmacy', 'farmacia');
UPDATE public.user_roles SET role = 'buyer' WHERE role = 'compras';

-- Same update for the plain cache table
UPDATE public.user_roles_plain SET role = 'manager' WHERE role = 'gerente';
UPDATE public.user_roles_plain SET role = 'chief' WHERE role = 'jefe';
UPDATE public.user_roles_plain SET role = 'coordinator' WHERE role = 'coordinador';
UPDATE public.user_roles_plain SET role = 'representative' WHERE role IN ('commercial_rep', 'rep_comercial', 'rep_integral', 'integral_rep', 'visitador_medico', 'medical_visitor');
UPDATE public.user_roles_plain SET role = 'doctor' WHERE role = 'medico';
UPDATE public.user_roles_plain SET role = 'pharmacist' WHERE role IN ('pharmacy', 'farmacia');
UPDATE public.user_roles_plain SET role = 'buyer' WHERE role = 'compras';

-- 3. DELETE DUPLICATES FROM role_permissions
DELETE FROM public.role_permissions
WHERE role_slug IN (
    'gerente', 'jefe', 'coordinador', 'medico', 'pharmacy', 'farmacia', 'compras',
    'commercial_rep', 'rep_comercial', 'rep_integral', 'integral_rep', 'visitador_medico', 'medical_visitor'
);

-- 4. DELETE DUPLICATES FROM app_roles
DELETE FROM public.app_roles
WHERE slug IN (
    'gerente', 'jefe', 'coordinador', 'medico', 'pharmacy', 'farmacia', 'compras',
    'commercial_rep', 'rep_comercial', 'rep_integral', 'integral_rep', 'visitador_medico', 'medical_visitor'
);

-- 5. ENSURE CANONICAL ROLES NAMES IN app_roles ARE CORRECT & IN SPANISH FOR MATRIX DISPLAY
UPDATE public.app_roles SET name = 'Gerente' WHERE slug = 'manager';
UPDATE public.app_roles SET name = 'Jefe Regional' WHERE slug = 'chief';
UPDATE public.app_roles SET name = 'Coordinador' WHERE slug = 'coordinator';
UPDATE public.app_roles SET name = 'Representante' WHERE slug = 'representative';
UPDATE public.app_roles SET name = 'Portal Médico' WHERE slug = 'doctor';
UPDATE public.app_roles SET name = 'Portal Farmacia' WHERE slug = 'pharmacist';
UPDATE public.app_roles SET name = 'Compras' WHERE slug = 'buyer';

-- 6. UNIFY MODULES NAMES IN app_permissions
UPDATE public.app_permissions SET module = 'Dashboard' WHERE module IN ('dashboard', 'Dashboard');
UPDATE public.app_permissions SET module = 'Objetivos' WHERE module IN ('objectives', 'Objetivos');
UPDATE public.app_permissions SET module = 'Visitas' WHERE module IN ('visits', 'Visitas');
UPDATE public.app_permissions SET module = 'Muestras' WHERE module IN ('samples', 'Muestras');
UPDATE public.app_permissions SET module = 'Médicos' WHERE module IN ('doctors', 'directory', 'Médicos');
UPDATE public.app_permissions SET module = 'Planificación' WHERE module IN ('planning', 'Planificación');
UPDATE public.app_permissions SET module = 'Precios' WHERE module IN ('pricing', 'Precios');
UPDATE public.app_permissions SET module = 'Inventario' WHERE module IN ('inventory', 'Inventario');
UPDATE public.app_permissions SET module = 'Transferencias' WHERE module IN ('transfers', 'Transferencias');
UPDATE public.app_permissions SET module = 'Pedidos' WHERE module IN ('orders', 'Pedidos');
UPDATE public.app_permissions SET module = 'Farmacias' WHERE module IN ('pharmacies', 'Farmacias');
UPDATE public.app_permissions SET module = 'Ciclos' WHERE module IN ('cycles', 'Ciclos');
UPDATE public.app_permissions SET module = 'Reportes' WHERE module IN ('reports', 'Reportes');
UPDATE public.app_permissions SET module = 'Administración' WHERE module IN ('admin', 'Administración');
UPDATE public.app_permissions SET module = 'Usuarios' WHERE module IN ('Usuarios');
UPDATE public.app_permissions SET module = 'Sistema' WHERE module IN ('Sistema');
UPDATE public.app_permissions SET module = 'Configuración' WHERE module IN ('Configuración');
UPDATE public.app_permissions SET module = 'Datos' WHERE module IN ('Data', 'Datos');
UPDATE public.app_permissions SET module = 'Almacén' WHERE module IN ('Almacén');
UPDATE public.app_permissions SET module = 'Servicios' WHERE module IN ('Servicios');
UPDATE public.app_permissions SET module = 'Finanzas' WHERE module IN ('Finanzas');
UPDATE public.app_permissions SET module = 'Telemarketing' WHERE module IN ('Telemarketing');

COMMIT;

-- 7. NOTIFY PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
