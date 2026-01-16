-- Force schema reload and ensure data structure
-- This handles potential stale cache or failed initial population

-- 1. Ensure user_roles_plain has data (Retry population)
INSERT INTO public.user_roles_plain (user_id, role, zone_id, company_id, updated_at)
SELECT user_id, role, zone_id, company_id, updated_at FROM public.user_roles
ON CONFLICT (user_id) DO UPDATE 
SET role = EXCLUDED.role, zone_id = EXCLUDED.zone_id, company_id = EXCLUDED.company_id;

-- 2. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';

-- 3. Modify comments to force metadata update
COMMENT ON TABLE public.visits IS ' Visits table with RBAC (Refreshed)';
COMMENT ON FUNCTION public.get_my_role() IS 'Helper for RBAC (Refreshed)';
