-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- MINIMAL SEED: Demo Medical Corp
-- Date: 2026-01-01
-- Purpose: Only sets up the organization. Auth is handled by the app.
-- =====================================================

INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, onboarding_completed, created_at)
VALUES (
    'd3300000-0000-0000-0000-000000000001',
    'Demo Medical Corp',
    'demo-medical',
    'professional',
    'active',
    true,
    now()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

RAISE NOTICE 'Demo Organization seeded successfully';
