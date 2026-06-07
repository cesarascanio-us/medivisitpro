-- ========================================================================
-- DATABASE AUDIT FIX: RESOLVE IS_MASTER PERMISSION DENIED (ERROR 42501)
-- ========================================================================

-- 1. Reemplazar is_master() para que use la tabla profiles, no emails hardcodeados.
-- Nota: La columna en 'profiles' que referencia a auth.users es 'id'.
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_master = true
  );
END;
$$;

-- 2. Dar permisos de ejecución a los roles anon, authenticated y service_role
GRANT EXECUTE ON FUNCTION public.is_master() TO anon;
GRANT EXECUTE ON FUNCTION public.is_master() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_master() TO service_role;

-- 3. Marcar a César como master en profiles (si no está marcado)
UPDATE public.profiles
SET is_master = true
WHERE email IN ('cesar.ascanio@gmail.com', 'cesarascaniofp.us@gmail.com');

-- 4. Refrescar el esquema para que la API de PostgREST reconozca el cambio de inmediato
NOTIFY pgrst, 'reload schema';
