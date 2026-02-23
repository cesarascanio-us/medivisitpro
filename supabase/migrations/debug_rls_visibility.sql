-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================


-- Script to debug RLS visibility for Manager
-- We will simulate being the manager 'cesarascanio.edu@gmail.com'
-- and see what rows are returned from profiles and user_roles.

-- NOTE: This script is for debugging logic. 
-- In pure SQL editor, we can look at the data directly if we are admin/postgres role.
-- To simulate the user, we'd need to set role, but here we will just inspect the data
-- and the function output for that specific user.

DO $$
DECLARE
    manager_id uuid;
    org_id uuid;
    role_count int;
    profile_count int;
BEGIN
    -- 1. Get Manager ID
    SELECT id INTO manager_id FROM auth.users WHERE email = 'cesarascanio.edu@gmail.com';
    
    -- 2. Check what the helper function would return for this user
    -- We can't easily execute "AS USER" in a DO block without extensions, 
    -- but we can manually run the logic of the function.
    SELECT organization_id INTO org_id FROM public.user_roles WHERE user_id = manager_id;
    
    RAISE NOTICE 'Manager ID: %', manager_id;
    RAISE NOTICE 'Manager Org ID: %', org_id;

    -- 3. Count how many roles exist for this Org (Should be > 1)
    SELECT count(*) INTO role_count FROM public.user_roles WHERE organization_id = org_id;
    RAISE NOTICE 'Total Roles in Org %: %', org_id, role_count;

    -- 4. Count how many profiles exist for users in this Org (Should be > 1)
    SELECT count(*) INTO profile_count 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE ur.organization_id = org_id;
    
    RAISE NOTICE 'Total Profiles in Org %: %', org_id, profile_count;
    
    -- If counts are > 1, then the DATA is correct.
    -- The issue is definitely that the POLICY is not letting the Manager see them.
END $$;
