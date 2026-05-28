ALTER FUNCTION public.populate_demo_user_data() SECURITY DEFINER SET search_path = public; GRANT SELECT ON auth.users TO service_role;
