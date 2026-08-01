-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- Demo Medical Organization Seed
-- Date: 2026-01-01
-- =====================================================

-- 1. Create the Demo Organization
INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, onboarding_completed)
VALUES (
    'd3300000-0000-0000-0000-000000000001'::uuid,
    'Demo Medical Corp',
    'demo-medical',
    'professional',
    'active',
    true
) ON CONFLICT (slug) DO NOTHING;

-- 2. Ensure RLS allows the demo login bypass or specific demo role
-- (The fix_onboarding_rls already helps here)
