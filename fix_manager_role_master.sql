
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IN ('cesar.ascanio@gmail.com') THEN
    RETURN TRUE;
  END IF;
  RETURN public.is_system_master();
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

