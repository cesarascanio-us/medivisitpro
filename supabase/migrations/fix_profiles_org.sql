DO 
DECLARE
    v_valid_org_id UUID;
BEGIN
    SELECT id INTO v_valid_org_id FROM public.organizations LIMIT 1;
    
    -- Actualizar perfiles usando user_id en lugar de id
    UPDATE public.profiles SET organization_id = v_valid_org_id 
    WHERE user_id IN ('45bf7587-4919-40d6-9230-0d3a0c8328e0', '8c242678-3c8c-4156-b602-a7d41597adcb');
    
    -- También actualizarlos si es que tuvieran roles de prueba (como supervisor, telemarketing, etc.)
    UPDATE public.profiles SET organization_id = v_valid_org_id 
    WHERE organization_id IN ('d3300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c6f517ba-204d-4f47-9db2-1af01214e3f9');
END ;
