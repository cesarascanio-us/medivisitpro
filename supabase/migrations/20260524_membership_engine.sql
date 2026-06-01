-- 1. Limpiar la duplicidad: unificar en billing_plans (abandonar subscription_plans)
-- Migrar los 3 registros existentes de subscription_plans a billing_plans
INSERT INTO billing_plans (id, name, description, tier, is_active, features)
SELECT 
  gen_random_uuid(),
  name,
  'Plan migrado de sistema antiguo', -- description no existe en subscription_plans
  name, -- slug fallback
  active,
  features
FROM subscription_plans
ON CONFLICT DO NOTHING;

-- 2. Agregar columna plan_id relacional a organizations
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES billing_plans(id),
  ADD COLUMN IF NOT EXISTS plan_modules jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS max_users integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_zones integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS trial_days_used integer DEFAULT 0;

-- 3. Tabla de módulos disponibles por plan
CREATE TABLE IF NOT EXISTS plan_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES billing_plans(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  module_name text NOT NULL,
  is_included boolean DEFAULT true,
  limit_value integer,  -- null = ilimitado
  created_at timestamptz DEFAULT now()
);

-- 4. Tabla de límites de uso por organización
CREATE TABLE IF NOT EXISTS org_usage_limits (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  max_users integer DEFAULT 10,
  max_zones integer DEFAULT 5,
  max_visits_monthly integer DEFAULT 500,
  max_products integer DEFAULT 50,
  max_doctors integer DEFAULT 100,
  current_users integer DEFAULT 0,
  current_zones integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 5. Tabla de historial de pagos manuales conectada a suscripciones
ALTER TABLE payment_reports
  ADD COLUMN IF NOT EXISTS subscription_extended_until date,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS extension_days integer DEFAULT 30;

-- RLS: solo master puede ver y modificar billing_plans y plan_modules
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo master puede gestionar planes"
ON billing_plans FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_master = true)
);

CREATE POLICY "Solo master gestiona módulos de plan"
ON plan_modules FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_master = true)
);

CREATE POLICY "Org puede leer sus propios límites"
ON org_usage_limits FOR SELECT
USING (organization_id = (
  SELECT organization_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1
));

-- MOTOR 2: ROLES DE ORGANIZACIÓN

-- Tabla de roles personalizados por organización
CREATE TABLE IF NOT EXISTS org_custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,                    -- "Gerente de Ventas Norte"
  slug text NOT NULL,                    -- "gerente-ventas-norte"
  base_role text NOT NULL,               -- hereda de: manager, representative, etc.
  description text,
  color text DEFAULT '#6B7A8D',          -- color identificador del rol
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Permisos asignados a cada rol personalizado
CREATE TABLE IF NOT EXISTS org_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_role_id uuid REFERENCES org_custom_roles(id) ON DELETE CASCADE,
  permission_code text REFERENCES app_permissions(code),
  granted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_role_id, permission_code)
);

-- Vincular usuario a rol personalizado de su organización
ALTER TABLE user_roles
  ADD COLUMN IF NOT EXISTS org_role_id uuid REFERENCES org_custom_roles(id);

-- RLS
ALTER TABLE org_custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_role_permissions ENABLE ROW LEVEL SECURITY;

-- Manager/Admin de la org puede gestionar sus propios roles
CREATE POLICY "Admins de org gestionan sus roles"
ON org_custom_roles FOR ALL
USING (
  organization_id = (
    SELECT organization_id FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin','manager')
    LIMIT 1
  )
);

-- Master puede ver y editar todo
CREATE POLICY "Master ve todos los roles"
ON org_custom_roles FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_master = true)
);
