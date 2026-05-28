-- Migration: Add access_level to role_permissions

-- 1. Add column
ALTER TABLE public.role_permissions 
ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'full' 
CHECK (access_level IN ('full', 'read_only'));

-- 2. Update specific permissions to 'read_only' (the half-moons ◐ from the HTML matrix)

-- DASHBOARD
-- Jefe (chief): Panel ejecutivo -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'chief' AND permission_code = 'dashboard.executive';
-- Coordinador: Panel regional -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'coordinator' AND permission_code = 'dashboard.regional';
-- Supervisor: Panel regional -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'supervisor' AND permission_code = 'dashboard.regional';
-- Admin, Gerente, Jefe: Panel táctico -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug IN ('admin', 'manager', 'chief') AND permission_code = 'dashboard.tactical';

-- VISITAS MEDICAS
-- Médico (doctor): Historial visitas -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'doctor' AND permission_code = 'visits.history';
-- Supervisor: Ver visitas equipo -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'supervisor' AND permission_code = 'visits.team';
-- Rep. Comercial: Auditoría farmacia -> ◐ (Wait, HTML says Rep. Comercial has ✓, Visit. Médico has ◐)
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'medical_visitor' AND permission_code = 'visits.audit';
-- Jefe: Coaching -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'chief' AND permission_code = 'visits.coaching';

-- DIRECTORIO MEDICO
-- Supervisor: Crear/Editar -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'supervisor' AND permission_code = 'directory.edit';
-- Visit. Médico, Rep. Integral: Crear/Editar -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug IN ('medical_visitor', 'integral_rep') AND permission_code = 'directory.edit';

-- FARMACIAS Y COMERCIAL
-- Visit. Médico: Ver farmacias -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'medical_visitor' AND permission_code = 'commercial.pharmacies';
-- Médico, Compras: Ver farmacias -> ◐ (HTML says Médico is —, Compras is ◐. Let's do Compras)
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'buyer' AND permission_code = 'commercial.pharmacies';
-- Farmacia: Ver farmacias -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'pharmacy' AND permission_code = 'commercial.pharmacies';
-- Coordinador: Crear transferencia -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'coordinator' AND permission_code = 'commercial.transfer';
-- Farmacia: Ver precios -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'pharmacy' AND permission_code = 'commercial.prices';
-- Coordinador: Stock -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'coordinator' AND permission_code = 'commercial.stock';
-- Farmacia: Stock -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'pharmacy' AND permission_code = 'commercial.stock';
-- Jefe: Licitaciones -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'chief' AND permission_code = 'commercial.negotiate';

-- MUESTRAS MEDICAS
-- Médico: Ver banco -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'doctor' AND permission_code = 'samples.bank';

-- PLANIFICACION Y CICLOS
-- Coordinador: Ciclos -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'coordinator' AND permission_code = 'planning.cycles';
-- Supervisor: Asignar rutas -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'supervisor' AND permission_code = 'planning.routes';

-- REPORTES Y ANALISIS
-- Jefe: Reportes nacionales -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'chief' AND permission_code = 'reports.national';
-- Coordinador, Supervisor: Reportes regionales -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug IN ('coordinator', 'supervisor') AND permission_code = 'reports.regional';
-- Supervisor, Telemarketing, Farmacia: Exportar -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug IN ('supervisor', 'telemarketing', 'pharmacy') AND permission_code = 'reports.export';
-- Jefe: Monitor financiero -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'chief' AND permission_code = 'reports.financial';
-- Compras: Monitor financiero -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'buyer' AND permission_code = 'reports.financial';

-- ADMINISTRACION
-- Gerente: Crear usuarios -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'manager' AND permission_code = 'admin.users';
-- Coordinador: Gestionar zonas -> ◐
UPDATE public.role_permissions SET access_level = 'read_only' WHERE role_slug = 'coordinator' AND permission_code = 'admin.zones';

-- Notify postgrest to reload schema cache
NOTIFY pgrst, 'reload schema';
