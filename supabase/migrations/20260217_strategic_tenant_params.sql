-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Advanced Multi-Tenant Strategic Parameters
-- Description: Adds configuration points for custom segmentation, competitor tracking, and global thresholds per organization.
-- Date: 2026-02-17
-- 1. Update organizations settings with strategic templates
UPDATE public.organizations
SET settings = settings || '{
    "segmentation_labels": ["A", "B", "C"],
    "competitor_brands": ["Genérico X", "Marca Líder Z", "Importado K"],
    "organization_min_stock": 5,
    "pop_checklist": ["Exhibidor de Mostrador", "Hablador de Precios", "Flyers Promocionales", "Vinilo de Vidriera"],
    "dosage_formula_templates": {
        "pediatric_default": "(dose * weight) / concentration"
    },
    "objection_scripts": [
        {"objection": "Precio", "script": "Nuestra relación costo-beneficio está respaldada por estudios clínicos que demuestran mejor adherencia."},
        {"objection": "Hábito", "script": "Entiendo su preferencia habitual, pero el diferencial de sabor en esta presentación facilita el cumplimiento en niños."},
        {"objection": "Competencia", "script": "La competencia es excelente, pero nuestro producto ofrece 20% más de concentración por dosis."}
    ]
}'::jsonb
WHERE slug = 'biofarco';
-- Apply to main tenant as example
-- 2. Ensure products table has advanced strategic fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS dosage_config JSONB DEFAULT '{
        "default_dose_mg_kg": 0,
        "concentration_mg_ml": 1,
        "presentation_unit": "mL"
    }'::jsonb;
-- 3. Enhance visits table for multi-tenant competitor tracking
ALTER TABLE public.visits
ADD COLUMN IF NOT EXISTS competitor_brands_detected TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS pop_checklist_completed JSONB DEFAULT '{}';
-- 4. Registry for third-party distributors (Droguerías)
CREATE TABLE IF NOT EXISTS public.distributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for distributors
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Distributor Access" ON public.distributors FOR ALL USING (organization_id = get_my_organization_id());
-- Seed example distributors
INSERT INTO public.distributors (organization_id, name, email)
SELECT id,
    'Droguería Central',
    'pedidos@central.com'
FROM public.organizations
WHERE slug = 'biofarco' ON CONFLICT DO NOTHING;