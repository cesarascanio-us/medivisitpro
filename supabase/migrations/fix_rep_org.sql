-- Actualizar la organización del representante en la tabla de roles
UPDATE public.user_roles_plain
SET organization_id = 'c6f517ba-204d-4f47-9db2-1af01214e3f9'
WHERE user_id = '45bf7587-4919-40d6-9230-0d3a0c8328e0';

-- Actualizar también en la tabla de perfiles para que estén 100% sincronizados
UPDATE public.profiles
SET organization_id = 'c6f517ba-204d-4f47-9db2-1af01214e3f9'
WHERE id = '45bf7587-4919-40d6-9230-0d3a0c8328e0';

-- Refrescar la base de datos
NOTIFY pgrst, 'reload schema';
