-- Migration: Dynamic Roles Matrix 
-- 1. Drop existing check constraints on role columns if they exist
DO $$ 
DECLARE
    con_name text;
BEGIN
    SELECT constraint_name INTO con_name
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'user_roles' AND column_name = 'role' AND constraint_name LIKE '%check%';
    
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE user_roles DROP CONSTRAINT ' || con_name;
    END IF;

    SELECT constraint_name INTO con_name
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'user_roles_plain' AND column_name = 'role' AND constraint_name LIKE '%check%';
    
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE user_roles_plain DROP CONSTRAINT ' || con_name;
    END IF;
END $$;

-- 2. Populate app_permissions with the 12 matrix module/actions
INSERT INTO public.app_permissions (code, name, module, description)
VALUES 
    -- DASHBOARD
    ('dashboard.executive', 'Panel ejecutivo', 'dashboard', 'KPIs nacionales'),
    ('dashboard.regional', 'Panel regional', 'dashboard', 'KPIs por zona'),
    ('dashboard.tactical', 'Panel táctico', 'dashboard', 'Agenda del día'),
    ('dashboard.external', 'Portal externo', 'dashboard', 'Cliente/médico'),
    
    -- VISITAS MEDICAS
    ('visits.history', 'Ver historial propio', 'visits', 'Historial de visitas'),
    ('visits.team', 'Ver historial equipo', 'visits', 'Visitas de todo el equipo'),
    ('visits.create', 'Registrar visita', 'visits', 'Registrar visita médica'),
    ('visits.audit', 'Auditoría farmacia', 'visits', 'Registrar auditoría de farmacia'),
    ('visits.coaching', 'Evaluación coaching', 'visits', 'Coaching de campo'),
    ('visits.gps', 'GPS / Radar', 'visits', 'Radar en tiempo real'),
    
    -- DIRECTORIO MEDICO
    ('directory.view', 'Ver médicos', 'directory', 'Ver todos los médicos'),
    ('directory.edit', 'Crear/Editar', 'directory', 'Crear o editar médicos'),
    ('directory.request', 'Solicitar visita', 'directory', 'Solicitar visita desde portal'),
    
    -- FARMACIAS Y COMERCIAL
    ('commercial.pharmacies', 'Ver farmacias', 'commercial', 'Ver todas las farmacias'),
    ('commercial.transfer', 'Crear transferencia', 'commercial', 'Crear pedido'),
    ('commercial.prices', 'Ver precios', 'commercial', 'Precios y descuentos'),
    ('commercial.approve', 'Aprobar transferencias', 'commercial', 'Aprobar alto volumen'),
    ('commercial.stock', 'Ver stock', 'commercial', 'Inventario droguerías'),
    ('commercial.purchases', 'Historial compras', 'commercial', 'Compras propias'),
    ('commercial.negotiate', 'Licitaciones', 'commercial', 'Negociar licitaciones'),
    
    -- MUESTRAS MEDICAS
    ('samples.bank', 'Ver banco', 'samples', 'Banco de muestras propio'),
    ('samples.distribute', 'Entregar muestras', 'samples', 'Descontar stock'),
    ('samples.request', 'Solicitar reposición', 'samples', 'Pedir reposición'),
    ('samples.approve', 'Aprobar lotes', 'samples', 'Aprobar y asignar lotes'),
    
    -- PLANIFICACION Y CICLOS
    ('planning.cycles', 'Ciclos promocionales', 'planning', 'Crear/editar ciclos'),
    ('planning.routes', 'Asignar rutas', 'planning', 'Asignar ficheros'),
    ('planning.agenda_own', 'Ver agenda propia', 'planning', 'Agenda del día'),
    ('planning.agenda_team', 'Ver agenda equipo', 'planning', 'Agenda de todo el equipo'),
    
    -- REPORTES Y ANALISIS
    ('reports.national', 'Reportes nacionales', 'reports', 'Reportes globales'),
    ('reports.regional', 'Reportes regionales', 'reports', 'Reportes por zona'),
    ('reports.export', 'Exportar datos', 'reports', 'Excel/PDF'),
    ('reports.financial', 'Monitor financiero', 'reports', 'KPIs de costo'),
    
    -- ADMINISTRACION
    ('admin.users', 'Gestionar usuarios', 'admin', 'Crear/editar usuarios'),
    ('admin.zones', 'Gestionar zonas', 'admin', 'Zonas y territorios'),
    ('admin.theme', 'Theme Builder', 'admin', 'Personalización visual'),
    ('admin.billing', 'Ver facturación', 'admin', 'Licencias SaaS')
ON CONFLICT (code) DO NOTHING;

-- 3. Populate app_roles
INSERT INTO public.app_roles (slug, name, is_system, color)
VALUES
    ('master', 'Master SaaS', true, 'bg-slate-900 text-white'),
    ('admin', 'Admin de Organización', true, 'bg-emerald-100 text-emerald-800'),
    ('manager', 'Gerente', false, 'bg-amber-100 text-amber-800'),
    ('chief', 'Jefe', false, 'bg-orange-100 text-orange-800'),
    ('coordinator', 'Coordinador', false, 'bg-blue-100 text-blue-800'),
    ('supervisor', 'Supervisor', false, 'bg-cyan-100 text-cyan-800'),
    ('telemarketing', 'Telemarketing', false, 'bg-sky-100 text-sky-800'),
    ('commercial_rep', 'Rep. Comercial', false, 'bg-green-100 text-green-800'),
    ('medical_visitor', 'Visitador Médico', false, 'bg-teal-100 text-teal-800'),
    ('integral_rep', 'Rep. Integral', false, 'bg-lime-100 text-lime-800'),
    ('pharmacy', 'Farmacia', false, 'bg-purple-100 text-purple-800'),
    ('doctor', 'Médico', false, 'bg-fuchsia-100 text-fuchsia-800'),
    ('buyer', 'Compras', false, 'bg-pink-100 text-pink-800'),
    -- Keep legacy roles temporarily to avoid breaking existing users during transition
    ('representative', 'Representante (Legacy)', false, 'bg-gray-100 text-gray-800'),
    ('pharmacist', 'Farmacéutico (Legacy)', false, 'bg-gray-100 text-gray-800')
ON CONFLICT (slug) DO NOTHING;

-- 4. Map role_permissions according to matrix (using ✓ and ◐ as granted permissions)
-- We use a CTE to easily grant bulk permissions

WITH role_grants AS (
    -- ADMIN
    SELECT 'admin' as role, code FROM public.app_permissions WHERE code NOT IN ('dashboard.external', 'visits.create', 'visits.audit', 'visits.coaching', 'directory.request', 'commercial.purchases', 'samples.distribute', 'samples.request', 'planning.agenda_own')
    UNION ALL
    -- GERENTE
    SELECT 'manager' as role, code FROM public.app_permissions WHERE code NOT IN ('dashboard.external', 'visits.create', 'visits.audit', 'visits.coaching', 'directory.request', 'commercial.purchases', 'samples.distribute', 'samples.request', 'planning.agenda_own', 'admin.theme', 'admin.billing')
    UNION ALL
    -- JEFE
    SELECT 'chief' as role, code FROM public.app_permissions WHERE code NOT IN ('dashboard.external', 'visits.create', 'visits.audit', 'directory.request', 'commercial.purchases', 'samples.distribute', 'samples.request', 'planning.agenda_own', 'admin.users', 'admin.theme', 'admin.billing')
    UNION ALL
    -- COORDINADOR
    SELECT 'coordinator' as role, code FROM public.app_permissions WHERE code IN ('dashboard.regional', 'dashboard.tactical', 'visits.history', 'visits.team', 'visits.gps', 'directory.view', 'directory.edit', 'commercial.pharmacies', 'commercial.transfer', 'commercial.stock', 'samples.bank', 'samples.request', 'samples.approve', 'planning.cycles', 'planning.routes', 'planning.agenda_own', 'planning.agenda_team', 'reports.regional', 'reports.export', 'admin.zones')
    UNION ALL
    -- SUPERVISOR
    SELECT 'supervisor' as role, code FROM public.app_permissions WHERE code IN ('dashboard.regional', 'dashboard.tactical', 'visits.history', 'visits.team', 'visits.create', 'visits.coaching', 'visits.gps', 'directory.view', 'directory.edit', 'commercial.pharmacies', 'samples.bank', 'planning.routes', 'planning.agenda_own', 'planning.agenda_team', 'reports.regional', 'reports.export')
    UNION ALL
    -- TELEMARKETING
    SELECT 'telemarketing' as role, code FROM public.app_permissions WHERE code IN ('dashboard.tactical', 'commercial.pharmacies', 'commercial.transfer', 'commercial.prices', 'commercial.stock', 'planning.agenda_own', 'reports.export')
    UNION ALL
    -- REP. COMERCIAL
    SELECT 'commercial_rep' as role, code FROM public.app_permissions WHERE code IN ('dashboard.tactical', 'visits.audit', 'commercial.pharmacies', 'commercial.transfer', 'commercial.prices', 'commercial.stock', 'planning.agenda_own')
    UNION ALL
    -- VISITADOR MEDICO
    SELECT 'medical_visitor' as role, code FROM public.app_permissions WHERE code IN ('dashboard.tactical', 'visits.history', 'visits.create', 'visits.audit', 'directory.view', 'directory.edit', 'commercial.pharmacies', 'samples.bank', 'samples.distribute', 'samples.request', 'planning.agenda_own')
    UNION ALL
    -- REP. INTEGRAL
    SELECT 'integral_rep' as role, code FROM public.app_permissions WHERE code IN ('dashboard.tactical', 'visits.history', 'visits.create', 'visits.audit', 'directory.view', 'directory.edit', 'commercial.pharmacies', 'commercial.transfer', 'commercial.prices', 'commercial.stock', 'samples.bank', 'samples.distribute', 'samples.request', 'planning.agenda_own')
    UNION ALL
    -- FARMACIA
    SELECT 'pharmacy' as role, code FROM public.app_permissions WHERE code IN ('dashboard.external', 'commercial.pharmacies', 'commercial.transfer', 'commercial.prices', 'commercial.stock', 'commercial.purchases', 'reports.export')
    UNION ALL
    -- MEDICO
    SELECT 'doctor' as role, code FROM public.app_permissions WHERE code IN ('dashboard.external', 'visits.history', 'directory.request', 'samples.bank', 'samples.request')
    UNION ALL
    -- COMPRAS
    SELECT 'buyer' as role, code FROM public.app_permissions WHERE code IN ('dashboard.external', 'commercial.pharmacies', 'commercial.prices', 'commercial.stock', 'commercial.purchases', 'commercial.negotiate', 'reports.export', 'reports.financial')
)
INSERT INTO public.role_permissions (role_slug, permission_code)
SELECT role, code FROM role_grants
ON CONFLICT DO NOTHING;

-- 5. Map existing legacy roles to new ones smoothly
UPDATE public.user_roles SET role = 'commercial_rep' WHERE role = 'representative';
UPDATE public.user_roles_plain SET role = 'commercial_rep' WHERE role = 'representative';
UPDATE public.user_roles SET role = 'pharmacy' WHERE role = 'pharmacist';
UPDATE public.user_roles_plain SET role = 'pharmacy' WHERE role = 'pharmacist';

-- 6. Add Foreign Key constraints
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_app_roles;
ALTER TABLE public.user_roles ADD CONSTRAINT fk_user_roles_app_roles FOREIGN KEY (role) REFERENCES public.app_roles(slug);

ALTER TABLE public.user_roles_plain DROP CONSTRAINT IF EXISTS fk_user_roles_plain_app_roles;
ALTER TABLE public.user_roles_plain ADD CONSTRAINT fk_user_roles_plain_app_roles FOREIGN KEY (role) REFERENCES public.app_roles(slug);

-- Notify postgrest to reload schema cache
NOTIFY pgrst, 'reload schema';
