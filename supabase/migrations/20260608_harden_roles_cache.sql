-- ========================================================================
-- DATABASE MIGRATION: HARDEN ROLES CACHE & INTRODUCE SELF-HEALING RPC
-- ========================================================================

-- 0. Ensure the company_id column exists on user_roles_plain cache table
-- This prevents crashes if previous migrations were not applied on this environment.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles_plain' AND column_name = 'company_id') THEN
        ALTER TABLE public.user_roles_plain ADD COLUMN company_id UUID;
    END IF;
END $$;

-- 1. Redefine trigger function with safe DELETE, INSERT and UPDATE handling
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM public.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSE
        INSERT INTO public.user_roles_plain (
            user_id, role, organization_id, company_id, state, region, supervisor_id, zone_id, updated_at
        )
        VALUES (
            NEW.user_id, 
            NEW.role, 
            NEW.organization_id, 
            COALESCE(NEW.company_id, NEW.organization_id), 
            NEW.state, 
            NEW.region, 
            NEW.supervisor_id, 
            NEW.zone_id, 
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            organization_id = EXCLUDED.organization_id,
            company_id = EXCLUDED.company_id,
            state = EXCLUDED.state,
            region = EXCLUDED.region,
            supervisor_id = EXCLUDED.supervisor_id,
            zone_id = EXCLUDED.zone_id,
            updated_at = NOW();
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure trigger exists on user_roles table
DROP TRIGGER IF EXISTS trigger_sync_user_roles_plain ON public.user_roles;
CREATE TRIGGER trigger_sync_user_roles_plain
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

-- 3. Create public.heal_session_cache() RPC
-- This SECURITY DEFINER function will be called on app mount/login to atomically repair
-- any desynchronization for the logged-in user in their own session.
CREATE OR REPLACE FUNCTION public.heal_session_cache()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_ur RECORD;
BEGIN
    -- Get current authenticated user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active session found');
    END IF;
    
    -- Check if user has a role in public.user_roles
    SELECT * INTO v_ur FROM public.user_roles WHERE user_id = v_user_id LIMIT 1;
    
    IF FOUND THEN
        -- Sync to user_roles_plain
        INSERT INTO public.user_roles_plain (
            user_id, role, organization_id, company_id, state, region, supervisor_id, zone_id, updated_at
        )
        VALUES (
            v_ur.user_id, 
            v_ur.role, 
            v_ur.organization_id, 
            COALESCE(v_ur.company_id, v_ur.organization_id), 
            v_ur.state, 
            v_ur.region, 
            v_ur.supervisor_id, 
            v_ur.zone_id, 
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            organization_id = EXCLUDED.organization_id,
            company_id = EXCLUDED.company_id,
            state = EXCLUDED.state,
            region = EXCLUDED.region,
            supervisor_id = EXCLUDED.supervisor_id,
            zone_id = EXCLUDED.zone_id,
            updated_at = NOW();
            
        RETURN jsonb_build_object('success', true, 'synced', true);
    ELSE
        -- If user has no role but exists in cache, delete from cache to avoid RLS leak/lockout
        DELETE FROM public.user_roles_plain WHERE user_id = v_user_id;
        RETURN jsonb_build_object('success', true, 'synced', false, 'cleared', true);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execution permissions for the heal_session_cache RPC to authenticated users
GRANT EXECUTE ON FUNCTION public.heal_session_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION public.heal_session_cache() TO anon;

-- 4. Reconcile all current user roles plain cache records with user_roles table
-- This clears all historical orphans and repairs any discrepancies immediately.
DELETE FROM public.user_roles_plain
WHERE user_id NOT IN (SELECT user_id FROM public.user_roles);

INSERT INTO public.user_roles_plain (
    user_id, role, organization_id, company_id, state, region, supervisor_id, zone_id, updated_at
)
SELECT 
    user_id, 
    role, 
    organization_id, 
    COALESCE(company_id, organization_id), 
    state, 
    region, 
    supervisor_id, 
    zone_id, 
    NOW()
FROM public.user_roles
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    organization_id = EXCLUDED.organization_id,
    company_id = EXCLUDED.company_id,
    state = EXCLUDED.state,
    region = EXCLUDED.region,
    supervisor_id = EXCLUDED.supervisor_id,
    zone_id = EXCLUDED.zone_id,
    updated_at = NOW();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
