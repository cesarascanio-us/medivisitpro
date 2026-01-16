-- Ver definiciones de las funciones actuales
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname IN ('get_my_role', 'get_my_zone_id', 'get_my_organization_id', 'is_org_admin')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
