-- Buscar TODAS las funciones que contengan auth.uid
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE prosrc LIKE '%auth.uid%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
