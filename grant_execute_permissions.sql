-- Solución al error: permission denied for function get_my_organization_id
-- Esto permite a los usuarios autenticados ejecutar las funciones de lectura de roles,
-- las cuales son críticas para las políticas de Row Level Security (RLS).

GRANT EXECUTE ON FUNCTION public.get_my_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_organization_id() TO anon;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon;

GRANT EXECUTE ON FUNCTION public.get_my_zone_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_zone_id() TO anon;

GRANT EXECUTE ON FUNCTION public.get_my_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_state() TO anon;

GRANT EXECUTE ON FUNCTION public.get_my_region() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_region() TO anon;

-- Asegurar que la tabla que consultan estas funciones también sea accesible
GRANT SELECT ON public.user_roles_plain TO authenticated;
GRANT SELECT ON public.user_roles_plain TO anon;

-- Refrescar el esquema para que la API reconozca los permisos
NOTIFY pgrst, 'reload schema';
