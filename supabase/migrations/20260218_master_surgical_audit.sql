-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MediVisitPro - Surgical Audit Fixes (Master Infrastructure)
-- Purpose: Implement robust state consistency and security for Master User operations.
-- Date: 2026-02-18
-- 1. Master Action Audit Log
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.master_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    -- 'user_role_change', 'org_deletion', 'plan_update'
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Automated Profile Sync (Consistency Protection)
-- -----------------------------------------------------------
-- This trigger ensures that when a Master changes a user's organization 
-- in user_roles, the profile is automatically updated. This prevents 
-- multi-tenant leakage where a user might be in Org A according to roles 
-- but Org B according to profile.
CREATE OR REPLACE FUNCTION public.sync_user_org_consistency() RETURNS TRIGGER AS $$ BEGIN
UPDATE public.profiles
SET organization_id = NEW.organization_id
WHERE user_id = NEW.user_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS tr_sync_user_org_consistency ON public.user_roles;
CREATE TRIGGER tr_sync_user_org_consistency
AFTER
UPDATE OF organization_id ON public.user_roles FOR EACH ROW EXECUTE PROCEDURE public.sync_user_org_consistency();
-- 3. Master Global View (Sentinel Enhancement)
-- -----------------------------------------------------------
-- Ensure security_alerts are cleared automatically if fixed
CREATE OR REPLACE FUNCTION public.resolve_security_alert(p_alert_type TEXT, p_table_name TEXT) RETURNS VOID AS $$ BEGIN
UPDATE public.security_alerts
SET is_resolved = true,
    resolved_at = NOW()
WHERE alert_type = p_alert_type
    AND (
        table_name = p_table_name
        OR p_table_name IS NULL
    )
    AND is_resolved = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
-- 4. Subscription Safety
-- -----------------------------------------------------------
-- Prevent accidental deletion of any organization that has an active professional subscription
-- unless forced by a Master flag.
CREATE OR REPLACE FUNCTION public.check_org_deletion_safety() RETURNS TRIGGER AS $$ BEGIN IF EXISTS (
        SELECT 1
        FROM public.subscriptions
        WHERE organization_id = OLD.id
            AND status = 'active'
            AND plan_id IN (
                SELECT id
                FROM public.billing_plans
                WHERE tier IN ('professional', 'enterprise')
            )
    ) THEN RAISE EXCEPTION 'No se puede eliminar una organización con suscripción activa de alto nivel. Cancele la suscripción primero.';
END IF;
RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
DROP TRIGGER IF EXISTS tr_check_org_deletion_safety ON public.organizations;
CREATE TRIGGER tr_check_org_deletion_safety BEFORE DELETE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE public.check_org_deletion_safety();