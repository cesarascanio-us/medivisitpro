-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- AUTH METADATA SYNC TRIGGER
-- Purpose: Automatically push roles and organization_id 
-- from public.user_roles to auth.users.raw_app_meta_data
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auth.users directly
    -- We use raw_app_meta_data for secure fields (role, org_id)
    -- and raw_user_meta_data for fields that might be useful on frontend (first_name, etc)
    
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', NEW.role,
            'organization_id', NEW.organization_id,
            'is_org_admin', COALESCE((SELECT is_org_admin FROM public.profiles WHERE user_id = NEW.user_id), false)
        )
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Apply trigger to user_roles
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
CREATE TRIGGER on_user_role_change
    AFTER INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_metadata();

-- Also sync on profile changes (for is_org_admin flag)
CREATE OR REPLACE FUNCTION public.sync_profile_metadata()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'is_org_admin', NEW.is_org_admin,
            'organization_id', NEW.organization_id
        ),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'organization_id', NEW.organization_id
        )
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_profile_change ON public.profiles;
CREATE TRIGGER on_profile_change
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_metadata();

-- Manual sync for existing data (Optional but recommended)
-- This ensures everyone is in sync immediately after running this script
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT user_id, role, organization_id FROM public.user_roles) LOOP
        UPDATE auth.users
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'role', r.role,
                'organization_id', r.organization_id
            )
        WHERE id = r.user_id;
    END LOOP;
END $$;
