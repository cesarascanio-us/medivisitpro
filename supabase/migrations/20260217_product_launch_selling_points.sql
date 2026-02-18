-- Migration: Strategic Product Launch Update (Fixed Constraint)
-- Description: Adds unique constraint to products and seeds the "NeuroFortis Plus" launch product.
-- Date: 2026-02-17
-- 1. Ensure categorical selling points column exists
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS selling_points JSONB DEFAULT '{}'::jsonb;
-- 2. Add Unique Constraint to prevent duplicates and enable ON CONFLICT
-- This ensures that a product name is unique within an organization
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_name_organization_unique'
) THEN
ALTER TABLE public.products
ADD CONSTRAINT products_name_organization_unique UNIQUE (name, organization_id);
END IF;
END $$;
-- 3. Update Organization Settings for the Launch Cycle
UPDATE public.organizations
SET settings = settings || '{
    "current_cycle_focus": "Lanzamiento NeuroFortis Plus",
    "cycle_objection_scripts": [
        {"objection": "Innovación", "script": "NeuroFortis representa un salto generacional en neuro-protección con su tecnología de liberación sostenida."},
        {"objection": "Disponibilidad", "script": "Estamos garantizando stock inicial en las 50 farmacias principales de su zona de influencia."}
    ],
    "pop_launch_checklist": ["Stand de Pedestal", "Dummies Gigantes", "Folleto Médico Premium"]
}'::jsonb
WHERE slug = 'biofarco';
-- 4. Seed the Launch Product for Biofarco
INSERT INTO public.products (
        organization_id,
        name,
        description,
        key_message,
        selling_points,
        therapeutic_area,
        category,
        dosage_config
    )
SELECT id as organization_id,
    'NeuroFortis Plus',
    'Suplemento neuroprotector de alta potencia con Omega-3 y Vitaminas del complejo B.',
    'Protección celular avanzada para el rendimiento cognitivo.',
    '{
        "Clínico": "Liberación controlada 24h",
        "Eficacia": "Mejora cognitiva en 14 días",
        "Seguridad": "Complejo B de grado médico",
        "Diferencial": "Sabor cereza natural"
    }'::jsonb,
    'Neurología',
    'Premium Launch',
    '{
        "default_dose_mg_kg": 5,
        "concentration_mg_ml": 50,
        "presentation_unit": "mL"
    }'::jsonb
FROM public.organizations
WHERE slug = 'biofarco' ON CONFLICT (name, organization_id) DO
UPDATE
SET selling_points = EXCLUDED.selling_points,
    key_message = EXCLUDED.key_message,
    description = EXCLUDED.description,
    dosage_config = EXCLUDED.dosage_config;