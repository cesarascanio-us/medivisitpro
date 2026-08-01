-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================


-- COMPREHENSIVE DIAGNOSIS SCRIPT
-- 1. Check if 'zones' or 'zonas' table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('zones', 'zonas');

-- 2. Debug RLS Logic for Manager
DO $$
DECLARE
    manager_id uuid;
    manager_org_id uuid;
    can_see boolean;
BEGIN
    -- Get Manager
    SELECT id INTO manager_id FROM auth.users WHERE email = 'cesarascanio.edu@gmail.com';
    RAISE NOTICE 'Manager ID: %', manager_id;

    -- Execute the Security Definer function logic manually
    SELECT organization_id INTO manager_org_id FROM public.user_roles WHERE user_id = manager_id LIMIT 1;
    RAISE NOTICE 'Manager Org ID (from user_roles): %', manager_org_id;

    -- Check if there are other roles in this org
    PERFORM 1 FROM public.user_roles WHERE organization_id = manager_org_id AND user_id != manager_id;
    IF FOUND THEN
        RAISE NOTICE 'Success: There are other users in this Org.';
    ELSE
        RAISE NOTICE 'Failure: No other users found in this Org.';
    END IF;

    -- Test the Policy Condition explicitly
    -- Policy: organization_id = public.get_auth_user_organization_id()
    -- We define a variable to simulate the function result
    -- Note: We can't easily impersonate execution of the function call in DO block perfectly without SET ROLE,
    -- but we verified the logic above.
    
    -- Check Table Policies
    RAISE NOTICE 'Checking Policies on user_roles:';
END $$;

-- 3. List Policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';

