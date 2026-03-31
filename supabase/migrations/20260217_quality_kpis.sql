-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Quality & Performance - Supervisor Evaluations
-- Description: Creates the structure for dual visit evaluations (Coaching) and market data metrics.
-- Date: 2026-02-17
-- 1. Create Field Coaching / Evaluation Table
-- This table stores the supervisor's assessment of a representative's performance during a dual visit.
CREATE TABLE IF NOT EXISTS public.field_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES public.profiles(id) NOT NULL,
    -- Who evaluates (Supervisor/Manager)
    representative_id UUID REFERENCES public.profiles(id) NOT NULL,
    -- Who is evaluated
    -- Technical Skills (Score 1-5)
    score_vademecum INTEGER CHECK (
        score_vademecum BETWEEN 1 AND 5
    ),
    score_objection_handling INTEGER CHECK (
        score_objection_handling BETWEEN 1 AND 5
    ),
    score_closing_skills INTEGER CHECK (
        score_closing_skills BETWEEN 1 AND 5
    ),
    -- Strategic Skills
    score_pre_call_planning INTEGER CHECK (
        score_pre_call_planning BETWEEN 1 AND 5
    ),
    score_sample_strategy BOOLEAN DEFAULT FALSE,
    -- Did they use samples strategically?
    -- Qualitative Feedback
    strengths TEXT,
    -- "Fortalezas"
    areas_for_improvement TEXT,
    -- "Áreas de Mejora"
    action_plan TEXT,
    -- "Plan de Acción" agreed for next cycle
    evaluation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Create Market Share Data Structure (Result KPIs)
-- Stores competitive intelligence data (e.g., from IMS/Close-up or manual audit)
CREATE TABLE IF NOT EXISTS public.market_share_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
    product_category TEXT NOT NULL,
    -- e.g., "Calcios", "Hierros"
    period_date DATE NOT NULL,
    -- Evaluation month (e.g., 2026-02-01)
    our_market_share NUMERIC(5, 2),
    -- 0-100%
    competitor_market_share NUMERIC(5, 2),
    total_market_value NUMERIC(12, 2),
    -- Total market size in currency
    source TEXT DEFAULT 'Manual Audit',
    -- 'IMS', 'Close-Up', 'Manual Audit'
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 3. Enable RLS
ALTER TABLE public.field_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_share_data ENABLE ROW LEVEL SECURITY;
-- 4. Policies for Field Evaluations
-- Supervisors/Managers can CREATE and READ all.
-- Representatives can ONLY READ their own evaluations.
CREATE POLICY "Supervisors Manage Evaluations" ON public.field_evaluations FOR ALL TO authenticated USING (
    get_my_role() IN ('master', 'admin', 'manager', 'supervisor')
) WITH CHECK (
    get_my_role() IN ('master', 'admin', 'manager', 'supervisor')
);
CREATE POLICY "Reps Read Own Evaluations" ON public.field_evaluations FOR
SELECT TO authenticated USING (
        representative_id = auth.uid()
        OR get_my_role() IN ('master', 'admin', 'manager', 'supervisor')
    );
-- 5. Policies for Market Share Data
-- Read access for everyone in the org.
-- Write access for Managers/Admins only.
CREATE POLICY "Read Org Market Data" ON public.market_share_data FOR
SELECT TO authenticated USING (organization_id = get_my_organization_id());
CREATE POLICY "Manage Org Market Data" ON public.market_share_data FOR ALL TO authenticated USING (
    organization_id = get_my_organization_id()
    AND get_my_role() IN ('master', 'admin', 'manager')
) WITH CHECK (
    organization_id = get_my_organization_id()
    AND get_my_role() IN ('master', 'admin', 'manager')
);