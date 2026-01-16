-- Ver TODAS las columnas de user_roles
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_roles'
ORDER BY ordinal_position;
