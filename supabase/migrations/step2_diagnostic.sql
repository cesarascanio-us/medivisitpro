-- =====================================================
-- MIGRACIÓN POR PASOS - Ejecutar uno a uno
-- Después de cada paso, indica si funcionó o falló
-- =====================================================

-- PASO 2A: Crear tabla organizations (si no existe)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    settings JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 2B: Insertar organización por defecto
INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, onboarding_completed)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Biofarco',
    'biofarco',
    'enterprise',
    'active',
    true
) ON CONFLICT (slug) DO NOTHING;

-- PASO 2C: Agregar columnas a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_org_admin BOOLEAN DEFAULT false;

-- PASO 2D: Desactivar RLS y actualizar profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
UPDATE profiles SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid WHERE organization_id IS NULL;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PASO 2E: Crear funciones nuevas para multi-tenant
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(is_org_admin, false) FROM profiles WHERE id::text = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Si llegaste hasta aquí sin errores, el problema está más adelante.
-- Ejecuta el archivo principal completo ahora.
