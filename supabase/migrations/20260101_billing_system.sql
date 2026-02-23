-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Phase 3: Multi-Payment Billing System Migration
-- Created: 2026-01-01

-- 1. Subscription Plans
CREATE TABLE IF NOT EXISTS billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tier TEXT NOT NULL UNIQUE, -- free, starter, professional, enterprise
    is_active BOOLEAN DEFAULT true,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Prices per Plan
CREATE TABLE IF NOT EXISTS billing_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES billing_plans(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    interval TEXT DEFAULT 'month', -- month, year
    provider_price_id TEXT, -- Stripe Price ID
    paypal_plan_id TEXT,    -- PayPal Plan ID
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenant Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES billing_plans(id),
    status TEXT NOT NULL, -- trialing, active, canceled, incomplete, past_due
    provider TEXT NOT NULL, -- stripe, paypal, binance, manual
    provider_subscription_id TEXT,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Unified Transaction Log
CREATE TABLE IF NOT EXISTS billing_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- pending, completed, failed, refunded
    provider TEXT NOT NULL, -- stripe, paypal, binance, checkout
    provider_transaction_id TEXT,
    payment_method_type TEXT, -- card, paypal, crypto, etc
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org ON billing_transactions(organization_id);

-- 6. Seed Initial Plans
INSERT INTO billing_plans (name, tier, description, features) VALUES
('Básico', 'free', 'Ideal para visitadores individuales comenzando.', '["Hasta 50 médicos", "Reportes básicos", "Agenda inteligente"]'),
('Profesional', 'starter', 'Para visitadores que buscan optimizar su territorio.', '["Médicos ilimitados", "Muestras médicas", "Reportes avanzados", "Sincronización offline"]'),
('Empresarial', 'professional', 'Visibilidad total para gerentes y supervisores.', '["Todo lo anterior", "Análisis de KPI", "Geolocalización", "Gestión de equipos", "API Access"]')
ON CONFLICT (tier) DO NOTHING;

-- 7. RLS Policies

-- Enable RLS
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;

-- Plans & Prices are public read-only
CREATE POLICY "Public read plans" ON billing_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public read prices" ON billing_prices FOR SELECT USING (is_active = true);

-- Subscriptions isolation
CREATE POLICY "Org can view own subscription" ON subscriptions
    FOR SELECT USING (organization_id = get_my_organization_id());

-- Transactions isolation
CREATE POLICY "Org can view own transactions" ON billing_transactions
    FOR SELECT USING (organization_id = get_my_organization_id());

-- Only admins/service role can manage billing for specific orgs
-- (Implementation note: Usually handled by webhooks/edge functions using service role)

-- 8. Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_plans_updated_at BEFORE UPDATE ON billing_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_billing_prices_updated_at BEFORE UPDATE ON billing_prices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
