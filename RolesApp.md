Perfecto. Con eso el Gerente queda definido como **Master de su organización**. Actualizo el mapa completo y redacto la instrucción:

---

## Instrucción para antigravity — Sistema de Roles, Privilegios y Dashboards

Implementa el sistema completo de roles de MediVisitPro con 3 niveles de autoridad, 12 roles operativos y dashboards personalizados por rol. Todo dinámico, configurable por el Master desde su panel.

---

### FASE 1 — Migraciones SQL

```sql
-- =============================================
-- ROLES DEL SISTEMA (12 roles operativos)
-- =============================================
INSERT INTO app_roles (id, slug, name, description, color, is_system) VALUES
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
-- PERMISOS GRANULARES (35 permisos)
-- =============================================
INSERT INTO app_permissions (code, name, module, description) VALUES
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

-- Función helper para asignar permisos
CREATE OR REPLACE FUNCTION assign_role_permissions(
  p_role_slug text,
  p_permissions text[]
) RETURNS void AS $$
DECLARE
  p text;
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM app_roles WHERE slug = p_role_slug;
  IF v_role_id IS NULL THEN RETURN; END IF;
  FOREACH p IN ARRAY p_permissions LOOP
    INSERT INTO role_permissions (role_slug, permission_code)
    VALUES (p_role_slug, p)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ADMIN — Control total de la organización
SELECT assign_role_permissions('admin', ARRAY[
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
SELECT assign_role_permissions('gerente', ARRAY[
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
SELECT assign_role_permissions('jefe', ARRAY[
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
SELECT assign_role_permissions('coordinador', ARRAY[
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
SELECT assign_role_permissions('supervisor', ARRAY[
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
SELECT assign_role_permissions('telemarketing', ARRAY[
  'dashboard.tactico',
  'pharmacies.view','transfers.create',
  'pricing.view','pricing.discount',
  'inventory.view',
  'agenda.view_own',
  'reports.export'
]);

-- REPRESENTANTE COMERCIAL — Farmacias sell-in/sell-out
SELECT assign_role_permissions('rep_comercial', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.create','visits.audit_pharmacy',
  'pharmacies.view','transfers.create',
  'pricing.view','pricing.discount',
  'inventory.view',
  'agenda.view_own'
]);

-- VISITADOR MÉDICO — Visitas científicas
SELECT assign_role_permissions('visitador_medico', ARRAY[
  'dashboard.tactico',
  'visits.view_own','visits.create',
  'doctors.view','doctors.edit',
  'pharmacies.view',
  'samples.view','samples.deliver','samples.request',
  'agenda.view_own'
]);

-- REPRESENTANTE INTEGRAL — Comercial + Médico
SELECT assign_role_permissions('rep_integral', ARRAY[
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
SELECT assign_role_permissions('farmacia', ARRAY[
  'dashboard.portal',
  'transfers.create',
  'pricing.view',
  'inventory.view',
  'orders.view_own',
  'reports.export'
]);

-- MÉDICO — Portal científico externo
SELECT assign_role_permissions('medico', ARRAY[
  'dashboard.portal',
  'doctors.request_visit',
  'samples.view','samples.request',
  'visits.view_own'
]);

-- COMPRAS INSTITUCIONAL — Negociaciones masivas
SELECT assign_role_permissions('compras', ARRAY[
  'dashboard.portal',
  'pharmacies.view',
  'pricing.view','pricing.negotiate',
  'inventory.view',
  'orders.view_own',
  'reports.export'
]);

-- =============================================
-- ROLES DISPONIBLES POR PLAN
-- =============================================
CREATE TABLE IF NOT EXISTS plan_available_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier text NOT NULL,
  role_slug text NOT NULL REFERENCES app_roles(slug),
  UNIQUE(plan_tier, role_slug)
);

-- Starter: roles básicos
INSERT INTO plan_available_roles (plan_tier, role_slug) VALUES
  ('starter','admin'),('starter','gerente'),
  ('starter','rep_comercial'),('starter','farmacia')
ON CONFLICT DO NOTHING;

-- Pro: agrega campo y supervisión
INSERT INTO plan_available_roles (plan_tier, role_slug) VALUES
  ('pro','admin'),('pro','gerente'),('pro','jefe'),
  ('pro','coordinador'),('pro','supervisor'),('pro','telemarketing'),
  ('pro','rep_comercial'),('pro','visitador_medico'),
  ('pro','farmacia'),('pro','medico')
ON CONFLICT DO NOTHING;

-- Team / Enterprise: todos los roles
INSERT INTO plan_available_roles (plan_tier, role_slug)
SELECT 'team', slug FROM app_roles
ON CONFLICT DO NOTHING;

INSERT INTO plan_available_roles (plan_tier, role_slug)
SELECT 'enterprise', slug FROM app_roles
ON CONFLICT DO NOTHING;
```

---

### FASE 2 — Panel del Master: Tab "Roles Globales" renovado

Reemplaza el Tab 4 del `MasterPanel.tsx` con este editor de roles completo:

```tsx
// Tab "Roles Globales" en MasterPanel.tsx
// Estructura: 3 columnas
// Col 1 (250px): Lista de los 12 roles con su color e ícono
// Col 2 (flex): Matrix de permisos por módulo (checkboxes)
// Col 3 (250px): Configuración de disponibilidad por plan

// LISTA DE ROLES — col izquierda
const ROLES_CONFIG = [
  { slug:'admin',            label:'Administrador',          icon:Shield,         color:'#0B5C6E', nivel:'Ejecutivo' },
  { slug:'gerente',          label:'Gerente',                icon:Crown,          color:'#1D4ED8', nivel:'Ejecutivo' },
  { slug:'jefe',             label:'Jefe Regional',          icon:Star,           color:'#7C3AED', nivel:'Ejecutivo' },
  { slug:'coordinador',      label:'Coordinador',            icon:GitBranch,      color:'#0891B2', nivel:'Supervisión'},
  { slug:'supervisor',       label:'Supervisor de Campo',    icon:Eye,            color:'#059669', nivel:'Supervisión'},
  { slug:'telemarketing',    label:'Telemarketing',          icon:Phone,          color:'#D97706', nivel:'Supervisión'},
  { slug:'rep_comercial',    label:'Rep. Comercial',         icon:Store,          color:'#DC2626', nivel:'Campo'     },
  { slug:'visitador_medico', label:'Visitador Médico',       icon:Stethoscope,    color:'#2563EB', nivel:'Campo'     },
  { slug:'rep_integral',     label:'Rep. Integral',          icon:Zap,            color:'#7C3AED', nivel:'Campo'     },
  { slug:'farmacia',         label:'Portal Farmacia',        icon:Building2,      color:'#065F46', nivel:'Externo'   },
  { slug:'medico',           label:'Portal Médico',          icon:HeartPulse,     color:'#1E40AF', nivel:'Externo'   },
  { slug:'compras',          label:'Compras Institucional',  icon:ShoppingCart,   color:'#92400E', nivel:'Externo'   },
]

// MATRIX DE PERMISOS — col central
// Organizar permisos por módulo en grupos colapsables
// Cada fila: checkbox + nombre del permiso + descripción breve
// Al hacer clic en checkbox → UPDATE role_permissions en Supabase inmediatamente
// Mostrar indicador de "guardando..." mientras actualiza

// DISPONIBILIDAD POR PLAN — col derecha
// Para el rol seleccionado, mostrar qué planes lo incluyen
// 4 switches: Starter | Pro | Team | Enterprise
// Al cambiar → UPDATE plan_available_roles en Supabase

// BOTÓN "Restaurar defaults" en cada rol
// Llama a una RPC que recarga los permisos originales del SQL de migración
```

---

### FASE 3 — Panel del Admin de Organización

El Admin de su organización necesita una página de gestión de usuarios con asignación de roles. Agrega en `/settings/users` o como tab en Settings:

```tsx
// src/pages/Settings.tsx — nuevo Tab "Equipo y Roles"

// SECCIÓN 1 — Usuarios actuales de la organización
// Tabla: Avatar | Nombre | Email | Rol | Zona | Estado | Acciones
// Acciones: [Cambiar rol] [Cambiar zona] [Desactivar] [Eliminar]

// Al hacer clic en "Cambiar rol":
// Select que muestra SOLO los roles disponibles según el plan de la org
// Query: SELECT role_slug FROM plan_available_roles
//        WHERE plan_tier = (SELECT plan_tier FROM organizations WHERE id = org_id)

// SECCIÓN 2 — Invitar usuario
// Input email + Select rol (filtrado por plan) + Select zona + Botón "Enviar invitación"

// SECCIÓN 3 — Gestión de zonas
// Tabla de zonas con el representante asignado a cada una
// Drag & drop para reasignar representantes a zonas

// Leer usuarios de la org:
const { data: teamMembers } = useQuery({
  queryKey: ['team', organizationId],
  queryFn: () => supabase
    .from('user_roles')
    .select(`
      user_id, role, is_active, zone_id,
      profile:profiles(first_name, last_name, email, avatar_url),
      zone:zones(name)
    `)
    .eq('organization_id', organizationId)
    .order('role')
})

// Roles disponibles para el plan de esta org:
const { data: availableRoles } = useQuery({
  queryKey: ['available_roles', orgPlanTier],
  queryFn: () => supabase
    .from('plan_available_roles')
    .select('role_slug, role:app_roles(name, color, description)')
    .eq('plan_tier', orgPlanTier)
})
```

---

### FASE 4 — DashboardRouter actualizado con los 12 roles

```tsx
// src/components/dashboard/DashboardRouter.tsx
// Actualizar para despachar correctamente los 12 roles

const DashboardRouter = () => {
  const { profile } = useAuth()
  const role = profile?.role

  // EJECUTIVOS — Centro de mando con KPIs completos
  if (['admin', 'gerente'].includes(role))
    return <DashboardManager />   // ya construido — tiene todo

  // JEFE REGIONAL — KPIs regionales + su equipo
  if (role === 'jefe')
    return <DashboardJefe />      // nuevo — ver abajo

  // SUPERVISIÓN TÁCTICA — Agenda + equipo + aprobaciones
  if (['coordinador', 'supervisor'].includes(role))
    return <DashboardSupervisor />

  // TELEMARKETING — Carrito rápido + stock en vivo
  if (role === 'telemarketing')
    return <DashboardTelemarketing />

  // CAMPO COMERCIAL — Mobile-first, agenda del día
  if (role === 'rep_comercial')
    return <DashboardRepresentative mode="comercial" />

  // CAMPO MÉDICO — Mobile-first, visitas científicas
  if (role === 'visitador_medico')
    return <DashboardRepresentative mode="medico" />

  // CAMPO INTEGRAL — Selector de modo al inicio del día
  if (role === 'rep_integral')
    return <DashboardRepresentative mode="integral" />

  // PORTALES EXTERNOS — UI simplificada
  if (role === 'farmacia')
    return <PortalFarmacia />

  if (role === 'medico')
    return <DashboardDoctor />    // ya construido

  if (role === 'compras')
    return <PortalCompras />

  return <DashboardDefault />
}
```

---

### FASE 5 — Dashboards nuevos necesarios

**DashboardJefe.tsx** — Jefe Regional:
```
SECCIÓN 1 — KPIs de su región
  Cumplimiento de cuota regional | Visitas semana | Farmacias cubiertas | Pedidos procesados

SECCIÓN 2 — Mi equipo (Coordinadores y Supervisores bajo su mando)
  Lista con: nombre, zona, visitas hoy, % meta, última actividad

SECCIÓN 3 — Mapa de cobertura regional
  Vista del mapa con sus zonas asignadas y actividad del día

SECCIÓN 4 — Transferencias pendientes de aprobación
  Las que exceden autoridad del supervisor → el Jefe aprueba

SECCIÓN 5 — Objetivos del ciclo vs realidad
  Gráfico de barra: meta vs logrado por semana del ciclo
```

**DashboardSupervisor.tsx** — Coordinador y Supervisor:
```
SECCIÓN 1 — Radar GPS (primera pantalla — lo más importante)
  Mapa en tiempo real con la ubicación de cada representante
  Punto verde = en visita activa | Gris = en tránsito | Rojo = fuera de ruta

SECCIÓN 2 — Agenda de hoy del equipo
  Timeline del día con las visitas programadas vs completadas

SECCIÓN 3 — Asignación rápida de ficheros
  Drag & drop para mover médicos/farmacias entre representantes

SECCIÓN 4 — Formularios de coaching pendientes
  Lista de visitas donde acompañó al representante y debe evaluar
```

**DashboardTelemarketing.tsx** — Flujo ultra-rápido:
```
SECCIÓN 1 — Buscador de farmacia (autofoco al cargar)
  Input grande prominente: "Buscar farmacia por nombre o RIF..."
  Al seleccionar farmacia → abre carrito directamente

SECCIÓN 2 — Carrito activo (si hay pedido en curso)
  Lista de productos, cantidades, precios, descuentos aplicados
  Stock en tiempo real desde droguerías

SECCIÓN 3 — Mis pedidos del día
  Tabla de transferencias creadas hoy con su estado

SECCIÓN 4 — Farmacias sin visita reciente (su lista de llamadas)
  Ordenadas por prioridad: días sin contacto + potencial
```

**PortalFarmacia.tsx** — B2B externo:
```
SECCIÓN 1 — Mi cuenta
  Nombre farmacia | Límite de crédito | Saldo pendiente | Plan de pagos

SECCIÓN 2 — Hacer pedido (flujo principal)
  Catálogo de productos con precios netos de la farmacia
  Carrito → Confirmar pedido → Estado de despacho

SECCIÓN 3 — Mis pedidos
  Historial con estado: Pendiente / Despachado / Entregado / Facturado

SECCIÓN 4 — Ofertas vigentes
  Bonificaciones activas del laboratorio para esta farmacia
```

**PortalCompras.tsx** — Institucional:
```
SECCIÓN 1 — Cotizaciones activas
  Listado de propuestas del laboratorio pendientes de aprobación

SECCIÓN 2 — Lista de precios institucionales
  Tabla completa de precios netos negociados para su cadena

SECCIÓN 3 — Estadísticas de compras
  Volumen mensual, devoluciones, cumplimiento del contrato

SECCIÓN 4 — Contacto directo con KAM
  Mensaje directo al Gerente o Jefe asignado a su cuenta
```

**DashboardRepresentative modo "integral":**
```tsx
// Al cargar → Modal selector de modo del día
<Dialog defaultOpen={!modeSelectedToday}>
  <DialogContent>
    <h2>¿Cómo empieza tu día hoy?</h2>
    <p>Selecciona tu modo de trabajo. Puedes cambiarlo durante el día.</p>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <button onClick={() => setMode('medico')}
        className="flex flex-col items-center gap-3 p-6 border-2 rounded-lg hover:border-primary">
        <Stethoscope className="w-8 h-8 text-blue-600" />
        <span className="font-semibold">Modo Médico</span>
        <span className="text-xs text-muted-foreground">Visitas científicas y muestras</span>
      </button>
      <button onClick={() => setMode('comercial')}
        className="flex flex-col items-center gap-3 p-6 border-2 rounded-lg hover:border-primary">
        <Store className="w-8 h-8 text-green-600" />
        <span className="font-semibold">Modo Comercial</span>
        <span className="text-xs text-muted-foreground">Farmacias y transferencias</span>
      </button>
    </div>
    // Cambiar modo en cualquier momento desde el header
  </DialogContent>
</Dialog>
```

---

### FASE 6 — Sidebar dinámico por rol

```tsx
// src/components/layout/Sidebar.tsx
// Reemplazar la lista estática de navegación por grupos dinámicos por rol

const NAV_GROUPS = {
  ejecutivo: [
    { section: 'Principal',
      items: [
        { href:'/dashboard',      label:'Panel de Control',    icon:LayoutDashboard, roles:['admin','gerente','jefe']          },
        { href:'/reports',        label:'Reportes',            icon:BarChart3,       roles:['admin','gerente','jefe']          },
        { href:'/finance-monitor',label:'Monitor Financiero',  icon:DollarSign,      roles:['admin','gerente'],  module:'finance'},
      ]
    },
    { section: 'Gestión Comercial',
      items: [
        { href:'/transfer-orders',label:'Transferencias',      icon:Package,         roles:['admin','gerente','jefe']          },
        { href:'/pharmacies',     label:'Farmacias',           icon:Store,           roles:['admin','gerente','jefe']          },
        { href:'/drugstores',     label:'Droguerías',          icon:FlaskConical,    roles:['admin','gerente','jefe']          },
        { href:'/objectives',     label:'Objetivos del Ciclo', icon:Target,          roles:['admin','gerente','jefe']          },
      ]
    },
    { section: 'Gestión Médica',
      items: [
        { href:'/doctors',        label:'Médicos',             icon:Stethoscope,     roles:['admin','gerente','jefe']          },
        { href:'/health-centers', label:'Centros de Salud',    icon:Building2,       roles:['admin','gerente','jefe']          },
        { href:'/sample-banks',   label:'Banco de Muestras',   icon:Pill,            roles:['admin','gerente','jefe']          },
      ]
    },
    { section: 'Administración',
      items: [
        { href:'/users',          label:'Equipo',              icon:Users,           roles:['admin','gerente']                 },
        { href:'/zones',          label:'Territorios',         icon:Map,             roles:['admin','gerente','jefe']          },
        { href:'/admin/theme-builder', label:'Personalizar',  icon:Palette,         roles:['admin']                           },
      ]
    },
  ],

  supervision: [
    { section: 'Mi Trabajo',
      items: [
        { href:'/dashboard',      label:'Centro de Mando',     icon:Radar,           roles:['coordinador','supervisor']        },
        { href:'/agenda',         label:'Agenda del Equipo',   icon:Calendar,        roles:['coordinador','supervisor']        },
        { href:'/coverage-map',   label:'Radar GPS',           icon:MapPin,          roles:['coordinador','supervisor']        },
      ]
    },
    { section: 'Operaciones',
      items: [
        { href:'/visits',         label:'Visitas',             icon:ClipboardList,   roles:['coordinador','supervisor']        },
        { href:'/planner',        label:'Planificador Rutas',  icon:Route,           roles:['coordinador','supervisor']        },
        { href:'/transfer-orders',label:'Transferencias',      icon:Package,         roles:['coordinador']                     },
      ]
    },
  ],

  telemarketing: [
    { section: 'Ventas',
      items: [
        { href:'/dashboard',      label:'Panel de Ventas',     icon:Phone,           roles:['telemarketing']                   },
        { href:'/pharmacies',     label:'Mis Farmacias',       icon:Store,           roles:['telemarketing']                   },
        { href:'/transfer-orders',label:'Mis Pedidos',         icon:Package,         roles:['telemarketing']                   },
      ]
    },
  ],

  campo: [
    { section: 'Mi Día',
      items: [
        { href:'/dashboard',      label:'Mi Agenda',           icon:Calendar,        roles:['rep_comercial','visitador_medico','rep_integral'] },
        { href:'/visits',         label:'Mis Visitas',         icon:MapPin,          roles:['rep_comercial','visitador_medico','rep_integral'] },
      ]
    },
    { section: 'Comercial',
      items: [
        { href:'/pharmacies',     label:'Mis Farmacias',       icon:Store,           roles:['rep_comercial','rep_integral']    },
        { href:'/transfer-orders',label:'Mis Pedidos',         icon:Package,         roles:['rep_comercial','rep_integral']    },
      ]
    },
    { section: 'Médico',
      items: [
        { href:'/doctors',        label:'Mis Médicos',         icon:Stethoscope,     roles:['visitador_medico','rep_integral'] },
        { href:'/sample-banks',   label:'Mis Muestras',        icon:Pill,            roles:['visitador_medico','rep_integral'] },
      ]
    },
  ],

  externo: [
    { section: 'Mi Portal',
      items: [
        { href:'/dashboard',      label:'Mi Cuenta',           icon:Home,            roles:['farmacia','medico','compras']     },
        { href:'/orders',         label:'Mis Pedidos',         icon:Package,         roles:['farmacia','compras']             },
        { href:'/visits',         label:'Mis Visitas',         icon:Calendar,        roles:['medico']                          },
      ]
    },
  ],
}

// En el componente Sidebar:
const { profile } = useAuth()
const { can } = usePermissions()

// Determinar grupo de navegación según rol
const roleGroup = useMemo(() => {
  if (['admin','gerente','jefe'].includes(profile?.role)) return 'ejecutivo'
  if (['coordinador','supervisor'].includes(profile?.role)) return 'supervision'
  if (profile?.role === 'telemarketing') return 'telemarketing'
  if (['rep_comercial','visitador_medico','rep_integral'].includes(profile?.role)) return 'campo'
  return 'externo'
}, [profile?.role])

// Renderizar solo el grupo correspondiente
// Filtrar ítems con module → verificar canAccessModule()
```

---

### ORDEN DE EJECUCIÓN

```bash
# 1. Ejecutar SQL en Supabase
supabase sql --file supabase/migrations/20260525_roles_permisos.sql

# Verificar
supabase sql --command "SELECT slug, name FROM app_roles ORDER BY name;"
# Debe devolver 12 filas

supabase sql --command "SELECT COUNT(*) FROM role_permissions;"
# Debe devolver ~140+ registros

# 2. Crear archivos nuevos:
# - src/components/dashboard/DashboardJefe.tsx
# - src/components/dashboard/DashboardSupervisor.tsx
# - src/components/dashboard/DashboardTelemarketing.tsx
# - src/pages/portals/PortalFarmacia.tsx
# - src/pages/portals/PortalCompras.tsx

# 3. Actualizar:
# - src/components/dashboard/DashboardRouter.tsx
# - src/components/layout/Sidebar.tsx
# - src/pages/MasterPanel.tsx (Tab Roles Globales)
# - src/pages/Settings.tsx (Tab Equipo y Roles)
# - src/hooks/usePermissions.ts (agregar los 12 slugs)
# - src/App.tsx (rutas de portales externos)

# 4. Verificar compilación
npx tsc --noEmit && npm run build

# Si limpio → /deploy
```