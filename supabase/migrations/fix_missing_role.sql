-- Script para auto-reparar usuarios que no tienen registro en user_roles_plain
-- Copiará el organization_id desde 'profiles' a 'user_roles_plain'

INSERT INTO public.user_roles_plain (user_id, role, organization_id, company_id)
SELECT 
    id as user_id,
    'representative' as role,
    organization_id,
    company_id
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_roles_plain)
AND organization_id IS NOT NULL;

-- Refrescar esquemas por si acaso
NOTIFY pgrst, 'reload schema';
