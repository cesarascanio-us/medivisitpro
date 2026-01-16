-- Create app_roles table
CREATE TABLE IF NOT EXISTS public.app_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    is_system boolean DEFAULT false,
    color text DEFAULT 'bg-slate-100 text-slate-800 border-slate-200',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create app_permissions table
CREATE TABLE IF NOT EXISTS public.app_permissions (
    code text PRIMARY KEY,
    name text NOT NULL,
    module text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create role_permissions table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_slug text REFERENCES public.app_roles(slug) ON DELETE CASCADE,
    permission_code text REFERENCES public.app_permissions(code) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (role_slug, permission_code)
);

-- Enable RLS
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Read-only public for now, Managed by Master/Admin)
CREATE POLICY "Public read access for roles" ON public.app_roles FOR SELECT USING (true);
CREATE POLICY "Master/Admin manage roles" ON public.app_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master', 'admin'))
);

CREATE POLICY "Public read access for permissions" ON public.app_permissions FOR SELECT USING (true);
CREATE POLICY "Master/Admin manage permissions" ON public.app_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master', 'admin'))
);

CREATE POLICY "Public read access for role_permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Master/Admin manage role_permissions" ON public.role_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master', 'admin'))
);

-- SEED DATA: Roles
INSERT INTO public.app_roles (slug, name, description, is_system, color) VALUES
('master', 'Master User', 'System Administrator with full access', true, 'bg-indigo-100 text-indigo-700 border-indigo-200'),
('admin', 'Administrador', 'Organization Administrator', true, 'bg-rose-100 text-rose-700 border-rose-200'),
('manager', 'Gerente', 'Commercial Manager', true, 'bg-slate-800 text-white border-slate-700'),
('coordinator', 'Coordinador', 'Regional Coordinator', true, 'bg-blue-100 text-blue-700 border-blue-200'),
('supervisor', 'Supervisor', 'Team Supervisor', true, 'bg-cyan-100 text-cyan-700 border-cyan-200'),
('representative', 'Representante', 'Medical Representative', true, 'bg-emerald-100 text-emerald-700 border-emerald-200'),
('telemarketing', 'Telemarketing', 'Telemarketing Specialist', true, 'bg-pink-100 text-pink-700 border-pink-200'),
('doctor', 'Médico', 'Doctor Account', true, 'bg-teal-50 text-teal-700 border-teal-200'),
('pharmacist', 'Farmacéutico', 'Pharmacy Account', true, 'bg-orange-50 text-orange-700 border-orange-200'),
('service_chief', 'Jefe de Servicios', 'Hospital Service Chief', true, 'bg-violet-100 text-violet-700 border-violet-200')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name, 
    color = EXCLUDED.color,
    is_system = true;

-- SEED DATA: Permissions
INSERT INTO public.app_permissions (code, name, module, description) VALUES
-- Users Module
('users.view', 'Ver Usuarios', 'Usuarios', 'Permite ver la lista de usuarios'),
('users.manage', 'Gestionar Usuarios', 'Usuarios', 'Crear, editar y eliminar usuarios'),
('users.impersonate', 'Auditar Usuarios', 'Usuarios', 'Entrar como otro usuario (Audit Mode)'),

-- Company/Data Module
('data.view_all', 'Ver Toda la Data', 'Data', 'Ver data de toda la organización sin restricciones'),
('company.manage', 'Gestionar Empresa', 'Configuración', 'Editar configuración de la empresa'),
('zones.manage', 'Gestionar Zonas', 'Configuración', 'Crear y editar zonas geográficas'),

-- Dashboard/Analytics
('analytics.view', 'Ver Analíticas', 'Dashboard', 'Ver gráficos y métricas avanzadas'),
('expenses.approve', 'Aprobar Gastos', 'Finanzas', 'Aprobar o rechazar reportes de gastos'),
('objectives.assign', 'Asignar Objetivos', 'Objetivos', 'Asignar metas mensuales'),

-- Products & Samples
('products.view', 'Ver Productos', 'Productos', 'Ver catálogo de productos'),
('products.manage', 'Gestionar Productos', 'Productos', 'Crear y editar productos'),
('samples.manage', 'Gestionar Muestras', 'Muestras', 'Gestionar inventario de muestras'),

-- Medical/Service
('medical_info.view', 'Ver Info Médica', 'Médicos', 'Ver información detallada de médicos'),
('service.manage', 'Gestionar Servicios', 'Servicios', 'Gestión de servicios hospitalarios'),
('history.view', 'Ver Historial Visitas', 'Visitas', 'Ver historial completo de visitas del equipo'),

-- Telemarketing
('telemarketing.access', 'Acceso Telemarketing', 'Telemarketing', 'Acceso al módulo de telemarketing'),

-- Warehouse
('warehouse.access', 'Acceso Almacén', 'Almacén', 'Acceso al módulo de almacén')

ON CONFLICT (code) DO NOTHING;

-- SEED DATA: Role Permission Assignments
-- Master gets everything (handled via code bypass usually, but good to have)
INSERT INTO public.role_permissions (role_slug, permission_code)
SELECT 'master', code FROM public.app_permissions
ON CONFLICT DO NOTHING;

-- Admin
INSERT INTO public.role_permissions (role_slug, permission_code)
SELECT 'admin', code FROM public.app_permissions
ON CONFLICT DO NOTHING;

-- Manager
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('manager', 'data.view_all'),
('manager', 'analytics.view'),
('manager', 'products.view'),
('manager', 'products.manage'),
('manager', 'samples.manage'),
('manager', 'service.manage'),
('manager', 'expenses.approve'),
('manager', 'objectives.assign'),
('manager', 'users.view'),
('manager', 'history.view')
ON CONFLICT DO NOTHING;

-- Coordinator
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('coordinator', 'analytics.view'),
('coordinator', 'expenses.approve'),
('coordinator', 'objectives.assign'),
('coordinator', 'history.view')
ON CONFLICT DO NOTHING;

-- Supervisor
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('supervisor', 'expenses.approve'),
('supervisor', 'objectives.assign'),
('supervisor', 'medical_info.view'),
('supervisor', 'history.view')
ON CONFLICT DO NOTHING;

-- Representative (Default View Own)
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('representative', 'products.view')
ON CONFLICT DO NOTHING;

-- Telemarketing
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('telemarketing', 'telemarketing.access')
ON CONFLICT DO NOTHING;

-- Doctor/Pharmacist
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('doctor', 'products.view'),
('doctor', 'medical_info.view'),
('doctor', 'history.view'),
('pharmacist', 'products.view'),
('pharmacist', 'samples.manage'),
('pharmacist', 'history.view')
ON CONFLICT DO NOTHING;
