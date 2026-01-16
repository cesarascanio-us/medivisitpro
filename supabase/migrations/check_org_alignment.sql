
SELECT 
    p.email, 
    p.first_name, 
    p.last_name, 
    ur.role, 
    ur.organization_id, 
    o.name as org_name
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.organizations o ON ur.organization_id = o.id
WHERE p.email IN ('cesarascanio.edu@gmail.com', 'cesarascaniofo.us@gmail.com', 'cesarascaniofp.us@gmail.com')
ORDER BY p.email;
