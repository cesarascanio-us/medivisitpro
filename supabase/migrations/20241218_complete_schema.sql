-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MediVisitPro - Complete Database Schema Extension
-- Run this in Supabase SQL Editor
-- Creates all missing tables for full functionality

-- =====================================================
-- 1. EVENTS/PRESENTATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'presentation', -- presentation, conference, training
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    location TEXT,
    scheduled_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    attendees_count INTEGER DEFAULT 0,
    notes TEXT,
    materials_used TEXT[],
    products_presented UUID[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own events" ON events
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_scheduled_date ON events(scheduled_date);

-- =====================================================
-- 2. DAILY PLANNER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_date DATE NOT NULL,
    title TEXT,
    notes TEXT,
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, plan_date)
);

CREATE TABLE IF NOT EXISTS daily_plan_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES daily_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_time TIME,
    duration_minutes INTEGER DEFAULT 30,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own daily plans" ON daily_plans
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_daily_plans_user_date ON daily_plans(user_id, plan_date);

ALTER TABLE daily_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own plan items" ON daily_plan_items
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_daily_plan_items_plan_id ON daily_plan_items(plan_id);

-- =====================================================
-- 3. OBJECTIVES/GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS objectives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    objective_type TEXT DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, yearly
    category TEXT DEFAULT 'visits', -- visits, sales, contacts, events
    target_value NUMERIC NOT NULL DEFAULT 0,
    current_value NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'count', -- count, currency, percentage
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, failed, paused
    priority TEXT DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own objectives" ON objectives
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_objectives_user_id ON objectives(user_id);
CREATE INDEX idx_objectives_dates ON objectives(start_date, end_date);

-- =====================================================
-- 4. SAMPLES INVENTORY TABLE (Enhanced)
-- =====================================================
-- Note: samples table may already exist, this adds more functionality
CREATE TABLE IF NOT EXISTS sample_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    lot_number TEXT,
    quantity_total INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_distributed INTEGER DEFAULT 0,
    quantity_expired INTEGER DEFAULT 0,
    expiry_date DATE NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE,
    storage_location TEXT,
    temperature_requirements TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active', -- active, low_stock, expired, depleted
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sample_distributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    inventory_id UUID REFERENCES sample_inventory(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    distribution_date TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sample_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sample inventory" ON sample_inventory
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_sample_inventory_user ON sample_inventory(user_id);
CREATE INDEX idx_sample_inventory_product ON sample_inventory(product_id);
CREATE INDEX idx_sample_inventory_expiry ON sample_inventory(expiry_date);

ALTER TABLE sample_distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sample distributions" ON sample_distributions
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_sample_distributions_inventory ON sample_distributions(inventory_id);

-- =====================================================
-- 5. EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- transport, meals, lodging, materials, other
    subcategory TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    vendor TEXT,
    receipt_url TEXT,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, reimbursed
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    budget_amount NUMERIC(10,2) NOT NULL,
    period_type TEXT DEFAULT 'monthly', -- weekly, monthly, quarterly, yearly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own expenses" ON expenses
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

ALTER TABLE expense_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own budgets" ON expense_budgets
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info', -- info, warning, success, error, reminder
    category TEXT DEFAULT 'system', -- system, visit, objective, expiry, approval
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    action_label TEXT,
    reference_type TEXT, -- visit, event, objective, sample, expense
    reference_id UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- 7. HELP/FAQ TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS help_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- getting_started, visits, products, samples, reports, settings
    subcategory TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- general, bug, feature, account, other
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to UUID,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Help articles are public read
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published help articles" ON help_articles
    FOR SELECT USING (is_published = true);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tickets" ON support_tickets
    FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- =====================================================
-- 8. USER ROLES ENHANCEMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'representative', -- master, admin, manager, supervisor, representative
    permissions JSONB DEFAULT '[]'::jsonb,
    territory TEXT,
    supervisor_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_company ON user_roles(company_id);

-- =====================================================
-- TRIGGER: Update updated_at on all tables
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['events', 'daily_plans', 'objectives', 'sample_inventory', 'expenses', 'expense_budgets', 'notifications', 'help_articles', 'support_tickets', 'user_roles'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- =====================================================
-- INSERT SAMPLE HELP ARTICLES
-- =====================================================
INSERT INTO help_articles (title, content, category, order_index) VALUES
('¿Cómo empezar?', 'Bienvenido a MedVisit Pro. Para comenzar, completa tu perfil en Configuración y añade tus primeros contactos.', 'getting_started', 1),
('Registrar una visita', 'Ve a Visitas > Nueva Visita. Selecciona el contacto, fecha y hora. Completa los productos presentados y notas.', 'visits', 1),
('Gestionar muestras', 'En el módulo de Muestras puedes registrar tu inventario, controlar lotes y registrar entregas a médicos.', 'samples', 1),
('Generar reportes', 'Accede a Reportes para ver estadísticas de visitas, productos más presentados y cumplimiento de objetivos.', 'reports', 1),
('Configurar objetivos', 'Define metas mensuales en Objetivos. El sistema calculará automáticamente tu progreso basado en visitas completadas.', 'getting_started', 2)
ON CONFLICT DO NOTHING;
