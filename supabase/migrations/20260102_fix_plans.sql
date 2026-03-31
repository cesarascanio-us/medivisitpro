-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Add slug column to subscription_plans to link with system logic
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS slug text;

-- Clear incorrect plans (safe to delete if no foreign keys yet, otherwise update)
DELETE FROM public.subscription_plans;

-- Insert Correct Plans
INSERT INTO public.subscription_plans (name, slug, price, interval, features, active) VALUES
('Free', 'free', 0, 'month', to_jsonb(ARRAY['Hasta 5 Usuarios', 'Funciones Básicas', 'Soporte Comunitario']), true),
('Professional', 'pro', 29.99, 'month', to_jsonb(ARRAY['Hasta 20 Usuarios', 'Reportes Avanzados', 'Soporte Email', 'Gestión de Inventario']), true),
('Enterprise', 'enterprise', 99.99, 'month', to_jsonb(ARRAY['Usuarios Ilimitados', 'Soporte Prioritario 24/7', 'API Access', 'Auditoría Completa']), true);

-- Update organizations table to ensure plan_tier is valid
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
