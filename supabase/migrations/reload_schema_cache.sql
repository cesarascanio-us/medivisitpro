-- =====================================================
-- Reload PostgREST schema cache
-- Run this after creating new tables if you get 404
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- Verify baremos table exists
SELECT 
    table_name,
    (SELECT count(*) FROM baremos) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'baremos';
