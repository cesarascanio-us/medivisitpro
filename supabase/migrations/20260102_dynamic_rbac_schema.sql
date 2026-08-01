-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Create app_roles table
CREATE TABLE IF NOT EXISTS public.app_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE, -- 'manager', 'admin', etc.
    name text NOT NULL, -- 'Gerente', 'Administrador'
    description text,
    is_system boolean DEFAULT false, -- If true, cannot be deleted
    color text DEFAULT 'bg-slate-100 text-slate-800', -- UI Badge color
    created_at timestamptz DEFAULT now()
);

-- Create app_permissions table
CREATE TABLE IF NOT EXISTS public.app_permissions (
    code text PRIMARY KEY, -- 'users.create', 'dashboard.view_all'
    name text NOT NULL,
    module text NOT NULL, -- 'Users', 'Sales', 'System'
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
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

-- RLS Policies (Simple for now: Master/Admin can manage, others view)
-- app_roles
CREATE POLICY "Allow read access for all authenticated users" ON public.app_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow full access for master" ON public.app_roles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'master')
);

-- app_permissions
CREATE POLICY "Allow read access for all authenticated users" ON public.app_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow full access for master" ON public.app_permissions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'master')
);

-- role_permissions
CREATE POLICY "Allow read access for all authenticated users" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow full access for master" ON public.role_permissions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'master')
);


-- SEED DATA: Roles
INSERT INTO public.app_roles (slug, name, description, is_system, color) VALUES
('master', 'Master', 'Superusuario con acceso total', true, 'bg-purple-100 text-purple-800'),
('admin', 'Administrador', 'Administrador de Organización', true, 'bg-red-100 text-red-800'),
('manager', 'Gerente', 'Gerente de Ventas / Regional', true, 'bg-slate-800 text-white'),
('coordinator', 'Coordinador', 'Coordinador de Zona/Equipo', true, 'bg-indigo-100 text-indigo-800'),
('supervisor', 'Supervisor', 'Supervisor de Campo', true, 'bg-green-100 text-green-800'),
('representative', 'Representante', 'Visitador Médico / Vendedor', true, 'bg-gray-100 text-gray-800'),
('telemarketing', 'Telemarketing', 'Agente de Ventas Telefónicas', true, 'bg-pink-100 text-pink-800'),
('doctor', 'Médico', 'Usuario Médico (Cliente)', true, 'bg-teal-100 text-teal-800'),
('pharmacist', 'Farmacéutico', 'Usuario Farmacia (Cliente)', true, 'bg-amber-100 text-amber-800'),
('service_chief', 'Jefe de Servicios', 'Jefe de Servicio Hospitalario', true, 'bg-cyan-100 text-cyan-800')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    is_system = EXCLUDED.is_system;

-- SEED DATA: Permissions (Baseline)
INSERT INTO public.app_permissions (code, name, module, description) VALUES
-- User Management
('users.view', 'Ver Usuarios', 'Usuarios', 'Puede ver la lista de usuarios'),
('users.create', 'Crear Usuarios', 'Usuarios', 'Puede crear nuevos usuarios'),
('users.edit', 'Editar Usuarios', 'Usuarios', 'Puede editar usuarios existentes'),
('users.delete', 'Eliminar Usuarios', 'Usuarios', 'Puede eliminar/desactivar usuarios'),
('roles.manage', 'Gestionar Roles', 'Sistema', 'Puede crear y editar roles del sistema'),

-- Dashboard Access
('dashboard.view_master', 'Ver Panel Master', 'Dashboard', 'Acceso al panel global'),
('dashboard.view_team', 'Ver Equipo', 'Dashboard', 'Ver rendimiento de subordinados'),
('dashboard.view_all_stats', 'Ver Todas las Estadísticas', 'Dashboard', 'Ver estadísticas globales sin filtro'),

-- Sales/Orders
('orders.view', 'Ver Pedidos', 'Ventas', 'Ver historial de pedidos'),
('orders.create', 'Crear Pedidos', 'Ventas', 'Crear nuevos pedidos'),
('orders.approve', 'Aprobar Pedidos', 'Ventas', 'Aprobar/Rechazar pedidos'),

-- Geography
('zones.manage', 'Gestionar Zonas', 'Sistema', 'Crear y asignar zonas/regiones')
ON CONFLICT (code) DO NOTHING;

-- SEED DATA: Role Permissions (Initial Mappings)
-- Master gets everything
INSERT INTO public.role_permissions (role_slug, permission_code)
SELECT 'master', code FROM public.app_permissions
ON CONFLICT DO NOTHING;

-- Manager
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('manager', 'users.view'),
('manager', 'users.create'), -- Usually managers hire? Or simple view? Giving create for now.
('manager', 'dashboard.view_team'),
('manager', 'dashboard.view_all_stats'),
('manager', 'orders.view'),
('manager', 'orders.approve')
ON CONFLICT DO NOTHING;

-- Telemarketing
INSERT INTO public.role_permissions (role_slug, permission_code) VALUES
('telemarketing', 'orders.create'),
('telemarketing', 'orders.view'),
('telemarketing', 'users.view') -- To see clients
ON CONFLICT DO NOTHING;
