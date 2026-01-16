-- =====================================================
-- DIAGNÓSTICO: Ver tipos de columnas exactos
-- Ejecutar todo completo
-- =====================================================

SELECT 
    table_name, 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (
    (table_name = 'profiles' AND column_name IN ('id', 'organization_id')) OR
    (table_name = 'user_roles' AND column_name IN ('user_id', 'organization_id')) OR
    (table_name = 'contacts' AND column_name IN ('user_id', 'organization_id')) OR
    (table_name = 'organizations' AND column_name = 'id')
)
ORDER BY table_name, column_name;
