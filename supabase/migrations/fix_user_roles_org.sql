DO 
DECLARE
    v_valid_org_id UUID;
BEGIN
    SELECT id INTO v_valid_org_id FROM public.organizations LIMIT 1;
    
    -- Sincronizar user_roles con la misma organización
    UPDATE public.user_roles SET organization_id = v_valid_org_id;

END ;
