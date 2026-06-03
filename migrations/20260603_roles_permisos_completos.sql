-- =============================================
-- MEDIVISITPRO — SISTEMA COMPLETO DE ROLES Y PERMISOS
-- Migración: 20260603
-- Autor: César Ascanio / Antigravity
-- =============================================

-- =============================================
-- TABLA app_permissions (si no existe)
-- =============================================
CREATE TABLE IF NOT EXISTS public.app_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  module text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ROLES DISPONIBLES POR PLAN (si no existe)
-- =============================================
CREATE TABLE IF NOT EXISTS public.plan_available_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier text NOT NULL,
  role_slug text NOT NULL,
  UNIQUE(plan_tier, role_slug)
);

-- Habilitar RLS para evitar alertas de seguridad en Supabase
ALTER TABLE public.plan_available_roles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'plan_available_roles' AND policyname = 'Public read access for plan_available_roles'
  ) THEN
    CREATE POLICY "Public read access for plan_available_roles" ON public.plan_available_roles FOR SELECT USING (true);
  END IF;
END $$;

-- =============================================
-- FUNCIÓN HELPER PARA ASIGNAR PERMISOS
-- =============================================
CREATE OR REPLACE FUNCTION assign_role_permissions(
  p_role_slug text,
  p_permissions text[]
) RETURNS void AS $$
DECLARE
  p text;
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.app_roles WHERE slug = p_role_slug;
  IF v_role_id IS NULL THEN RETURN; END IF;
  FOREACH p IN ARRAY p_permissions LOOP
    INSERT INTO public.role_permissions (role_slug, permission_code)
    VALUES (p_role_slug, p)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INICIO DE TRANSACCION ATOMICA (BLOQUE DO)
-- =============================================
DO $ATOMIC$ 
BEGIN

-- =============================================
-- ROLES DEL SISTEMA (12 roles operativos)
-- =============================================
INSERT INTO public.app_roles (id, slug, name, description, color, is_system) VALUES
  (gen_random_uuid(), 'admin',               'Administrador',           'Control total de la organización',                    '#0B5C6E', true),
  (gen_random_uuid(), 'gerente',             'Gerente',                 'Master de su organización — visión y control total',   '#1D4ED8', true),
  (gen_random_uuid(), 'jefe',                'Jefe Regional',           'Gestión estratégica regional',                        '#7C3AED', true),
  (gen_random_uuid(), 'coordinador',         'Coordinador',             'Planificación táctica y asignación de rutas',         '#0891B2', true),
  (gen_random_uuid(), 'supervisor',          'Supervisor de Campo',     'Supervisión en terreno y coaching',                   '#059669', true),
  (gen_random_uuid(), 'telemarketing',       'Telemarketing',           'Ventas internas y pedidos telefónicos',               '#D97706', true),
  (gen_random_uuid(), 'rep_comercial',       'Representante Comercial', 'Ventas en farmacias — sell-in y sell-out',            '#DC2626', true),
  (gen_random_uuid(), 'visitador_medico',    'Visitador Médico',        'Visitas científicas y entrega de muestras',           '#2563EB', true),
  (gen_random_uuid(), 'rep_integral',        'Representante Integral',  'Combinación comercial + médica',                      '#7C3AED', true),
  (gen_random_uuid(), 'farmacia',            'Portal Farmacia',         'Cliente externo — autoservicio B2B',                  '#065F46', true),
  (gen_random_uuid(), 'medico',              'Portal Médico',           'Cliente externo — portal científico',                 '#1E40AF', true),
  (gen_random_uuid(), 'compras',             'Compras Institucional',   'Negociaciones masivas y licitaciones',                '#92400E', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color;

-- =============================================
-- PERMISOS GRANULARES (35+ permisos)
-- =============================================
INSERT INTO public.app_permissions (code, name, module, description) VALUES
  -- Dashboard
  ('dashboard.ejecutivo',        'Dashboard Ejecutivo',          'dashboard',     'Panel nacional de KPIs'),
  ('dashboard.regional',         'Dashboard Regional',           'dashboard',     'Panel de KPIs por zona'),
  ('dashboard.tactico',          'Dashboard Táctico',            'dashboard',     'Agenda y panel del día'),
  ('dashboard.portal',           'Portal Externo',               'dashboard',     'Portal cliente farmacia/médico'),
  -- Visitas
  ('visits.view_own',            'Ver visitas propias',          'visits',        'Ver solo mis visitas registradas'),
  ('visits.view_team',           'Ver visitas del equipo',       'visits',        'Ver visitas de todos los reps'),
  ('visits.create',              'Registrar visita',             'visits',        'Crear nueva visita médica'),
  ('visits.audit_pharmacy',      'Auditoría de farmacia',        'visits',        'Registrar auditoría en punto de venta'),
  ('visits.coaching',            'Evaluación coaching',          'visits',        'Llenar formulario de evaluación de campo'),
  ('visits.gps_radar',           'Radar GPS equipo',             'visits',        'Ver ubicación del equipo en tiempo real'),
  -- Médicos
  ('doctors.view',               'Ver médicos',                  'doctors',       'Acceder al directorio médico'),
  ('doctors.edit',               'Editar médicos',               'doctors',       'Crear y modificar fichas de médicos'),
  ('doctors.request_visit',      'Solicitar visita',             'doctors',       'Solicitar visita desde portal médico'),
  -- Farmacias y Comercial
  ('pharmacies.view',            'Ver farmacias',                'pharmacies',    'Acceder al directorio de farmacias'),
  ('transfers.create',           'Crear transferencia',          'transfers',     'Generar orden de pedido/transferencia'),
  ('transfers.approve',          'Aprobar transferencia',        'transfers',     'Aprobar pedidos de alto volumen'),
  ('pricing.view',               'Ver precios',                  'pricing',       'Consultar lista de precios'),
  ('pricing.discount',           'Aplicar descuentos',           'pricing',       'Aplicar escalas de descuento'),
  ('pricing.negotiate',          'Negociar licitaciones',        'pricing',       'Negociar contratos institucionales'),
  ('inventory.view',             'Ver inventario',               'inventory',     'Consultar stock en droguerías'),
  ('inventory.manage',           'Gestionar inventario',         'inventory',     'Administrar stock y movimientos'),
  ('orders.view_own',            'Ver pedidos propios',          'orders',        'Ver historial de compras propio'),
  -- Muestras
  ('samples.view',               'Ver muestras',                 'samples',       'Ver banco de muestras propio'),
  ('samples.deliver',            'Entregar muestras',            'samples',       'Registrar entrega de muestras'),
  ('samples.request',            'Solicitar muestras',           'samples',       'Pedir reposición de muestras'),
  ('samples.approve',            'Aprobar muestras',             'samples',       'Aprobar y asignar lotes'),
  -- Planificación
  ('cycles.manage',              'Gestionar ciclos',             'cycles',        'Crear y editar ciclos promocionales'),
  ('cycles.assign_routes',       'Asignar rutas',                'cycles',        'Asignar ficheros a representantes'),
  ('agenda.view_own',            'Ver agenda propia',            'agenda',        'Ver mi agenda del día'),
  ('agenda.view_team',           'Ver agenda del equipo',        'agenda',        'Ver agenda de todo el equipo'),
  -- Reportes
  ('reports.national',           'Reportes nacionales',          'reports',       'Ver reportes a nivel nacional'),
  ('reports.regional',           'Reportes regionales',          'reports',       'Ver reportes de su zona'),
  ('reports.export',             'Exportar reportes',            'reports',       'Descargar Excel/PDF'),
  -- Administración
  ('admin.users',                'Gestionar usuarios',           'admin',         'Crear y editar usuarios de la org'),
  ('admin.zones',                'Gestionar zonas',              'admin',         'Administrar territorios y zonas'),
  ('admin.theme',                'Personalizador visual',        'admin',         'Acceder al Theme Builder'),
  ('admin.billing',              'Ver facturación',              'admin',         'Ver costos y licencias del SaaS'),
  ('objectives.manage',          'Gestionar objetivos',          'objectives',    'Definir metas del ciclo por representante'),
  ('discounts.manage',           'Gestionar escalas descuento',  'pricing',       'Definir tablas de descuento por volumen'),
  ('drugstores.negotiate',       'Negociar con droguerías',      'transfers',     'Acuerdos comerciales con distribuidores'),
  ('admin.almacen',              'Gestión almacén/despacho',     'admin',         'Control de inventario y despacho')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;



-- =============================================
-- MATRIX DE PERMISOS POR ROL
-- =============================================

-- ADMIN — Control total de la organización
PERFORM assign_role_permissions('admin', ARRAY[
  'dashboard.ejecutivo','dashboard.regional','dashboard.tactico',
  'visits.view_own','visits.view_team','visits.create','visits.audit_pharmacy','visits.gps_radar',
  'doctors.view','doctors.edit',
  'pharmacies.view','transfers.create','transfers.approve',
  'pricing.view','pricing.discount','pricing.negotiate',
  'inventory.view','inventory.manage',
  'samples.view','samples.deliver','samples.request','samples.approve',
  'cycles.manage','cycles.assign_routes','agenda.view_own','agenda.view_team',
  'reports.national','reports.regional','reports.export',
  'admin.users','admin.zones','admin.theme','admin.billing',
  'objectives.manage','discounts.manage','drugstores.negotiate','admin.almacen'
]);

-- GERENTE — Master de su organización (casi igual al admin)
PERFORM assign_role_permissions('gerente', ARRAY[
  'dashboard.ejecutivo','dashboard.regional','dashboard.tactico',
  'visits.view_own','visits.view_team','visits.create','visits.gps_radar',
  'doctors.view','doctors.edit',
  'pharmacies.view','transfers.create','transfers.approve',
  'pricing.view','pricing.discount','pricing.negotiate',
  'inventory.view','inventory.manage',
  'samples.view','samples.request','samples.approve',
  'cycles.manage','cycles.assign_routes','agenda.view_own','agenda.view_team',
  'reports.national','reports.regional','reports.export',
  'admin.users','admin.zones',
  'objectives.manage','discounts.manage','drugstores.negotiate','admin.almacen'
]);

-- JEFE REGIONAL — Visión regional estratégica
PERFORM assign_role_permissions('jefe', ARRAY[
  'dashboard.regional',
  'visits.view_own','visits.view_team','visits.gps_radar',
  'doctors.view','doctors.edit',
  'pharmacies.view','transfers.approve',
  'pricing.view','pricing.discount',
  'inventory.view',
  'samples.view','samples.approve',
  'cycles.manage','cycles.assign_routes','agenda.view_own','agenda.view_team',
  'reports.regional','reports.export',
  'admin.zones',
  'objectives.manage','discounts.manage'
]);

-- COORDINADOR — Planificación táctica
PERFORM assign_role_permissions('coordinador', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.view_team',
  'doctors.view',
  'pharmacies.view','transfers.create',
  'inventory.view',
  'samples.view','samples.request','samples.approve',
  'cycles.assign_routes','agenda.view_own','agenda.view_team',
  'reports.regional','reports.export'
]);

-- SUPERVISOR — Campo y coaching
PERFORM assign_role_permissions('supervisor', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.view_team','visits.create','visits.gps_radar','visits.coaching',
  'doctors.view','doctors.edit',
  'pharmacies.view',
  'inventory.view',
  'samples.view',
  'agenda.view_own','agenda.view_team',
  'reports.regional','reports.export'
]);

-- TELEMARKETING — Ventas internas
PERFORM assign_role_permissions('telemarketing', ARRAY[
  'dashboard.tactico',
  'pharmacies.view','transfers.create',
  'pricing.view','pricing.discount',
  'inventory.view',
  'agenda.view_own',
  'reports.export'
]);

-- REPRESENTANTE COMERCIAL — Farmacias sell-in/sell-out
PERFORM assign_role_permissions('rep_comercial', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.create','visits.audit_pharmacy',
  'pharmacies.view','transfers.create',
  'pricing.view','pricing.discount',
  'inventory.view',
  'agenda.view_own'
]);

-- VISITADOR MÉDICO — Visitas científicas
PERFORM assign_role_permissions('visitador_medico', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.create',
  'doctors.view','doctors.edit',
  'pharmacies.view',
  'samples.view','samples.deliver','samples.request',
  'agenda.view_own'
]);

-- REPRESENTANTE INTEGRAL — Comercial + Médico
PERFORM assign_role_permissions('rep_integral', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.create','visits.audit_pharmacy',
  'doctors.view','doctors.edit',
  'pharmacies.view','transfers.create',
  'pricing.view','pricing.discount',
  'inventory.view',
  'samples.view','samples.deliver','samples.request',
  'agenda.view_own'
]);

-- FARMACIA — Portal B2B externo
PERFORM assign_role_permissions('farmacia', ARRAY[
  'dashboard.portal',
  'transfers.create',
  'pricing.view',
  'inventory.view',
  'orders.view_own',
  'reports.export'
]);

-- MÉDICO — Portal científico externo
PERFORM assign_role_permissions('medico', ARRAY[
  'dashboard.portal',
  'doctors.request_visit',
  'samples.view','samples.request',
  'visits.view_own'
]);

-- COMPRAS INSTITUCIONAL — Negociaciones masivas
PERFORM assign_role_permissions('compras', ARRAY[
  'dashboard.portal',
  'pharmacies.view',
  'pricing.view','pricing.negotiate',
  'inventory.view',
  'orders.view_own',
  'reports.export'
]);



-- Starter: roles básicos
INSERT INTO public.plan_available_roles (plan_tier, role_slug) VALUES
  ('starter','admin'),('starter','gerente'),
  ('starter','rep_comercial'),('starter','farmacia')
ON CONFLICT DO NOTHING;

-- Pro: agrega campo y supervisión
INSERT INTO public.plan_available_roles (plan_tier, role_slug) VALUES
  ('pro','admin'),('pro','gerente'),('pro','jefe'),
  ('pro','coordinador'),('pro','supervisor'),('pro','telemarketing'),
  ('pro','rep_comercial'),('pro','visitador_medico'),
  ('pro','farmacia'),('pro','medico')
ON CONFLICT DO NOTHING;

-- Team / Enterprise: todos los roles
INSERT INTO public.plan_available_roles (plan_tier, role_slug)
SELECT 'team', slug FROM public.app_roles WHERE slug != 'master'
ON CONFLICT DO NOTHING;

INSERT INTO public.plan_available_roles (plan_tier, role_slug)
SELECT 'enterprise', slug FROM public.app_roles WHERE slug != 'master'
ON CONFLICT DO NOTHING;

END $ATOMIC$;
