-- ========================================================================
-- MASTER FIX FOR "PERMISSION DENIED FOR TABLE USERS"
-- ========================================================================

-- Fix is_system_master to avoid querying auth.users
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SET search_path = public;

-- Fix is_master to use jwt and avoid querying auth.users
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  -- 1. Hardcoded fail-safe for owner
  IF (auth.jwt() ->> 'email') IN ('cesar.ascanio@gmail.com', 'cesarascaniofp.us@gmail.com') THEN
    RETURN TRUE;
  END IF;
  
  -- 2. Check master_users table
  RETURN public.is_system_master();
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Also fix get_master_kpis which was missing parameters and causing a 404 in dashboard
CREATE OR REPLACE FUNCTION public.get_master_kpis()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    IF NOT public.is_master() THEN
        RETURN '{"error": "Unauthorized"}'::jsonb;
    END IF;

    SELECT jsonb_build_object(
        'total_organizations', (SELECT count(*) FROM public.organizations),
        'total_users', (SELECT count(*) FROM public.profiles),
        'active_users', (SELECT count(*) FROM public.user_roles WHERE is_active = true),
        'total_zones', (SELECT count(*) FROM public.zones)
    ) INTO result;

    RETURN result;
END;
$$;

-- Reload configuration
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
