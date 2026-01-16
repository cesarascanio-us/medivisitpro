-- Ver TODAS las políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    qual as policy_using,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
