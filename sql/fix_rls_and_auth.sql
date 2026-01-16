-- SQL Fixes for MediVisitPro Security & Auth
-- Execute this in the Supabase SQL Editor

-- 1. IDENTIFY TABLES WITHOUT RLS (based on screenshot)
-- Enabling RLS for the tables shown in the Security Advisor screenshot
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_drugstore_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_pvp_farmacia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_precios_biofarco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_droguerias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles_plain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plan_details ENABLE ROW LEVEL SECURITY;

-- 2. CREATE MASTER ACCESS POLICY
-- This policy allows users with 'master' role to do everything on every table
-- We use a function to check role to avoid recursion if possible, or direct checks

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'master'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix other existing functions reported in warnings
ALTER FUNCTION public.get_my_organization_id() SET search_path = '';
ALTER FUNCTION public.is_org_admin() SET search_path = '';
ALTER FUNCTION public.user_belongs_to_org(org_id UUID) SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.get_my_role() SET search_path = '';
ALTER FUNCTION public.get_my_zone_id() SET search_path = '';

-- 3. APPLY POLICIES TO TABLES (Example for some tables)
-- For each table, we'll add a policy for Master/Admin and a general policy for Authenticated users

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        -- Enable RLS dynamically
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

        -- Master policy: Full access
        EXECUTE format('DROP POLICY IF EXISTS "Master Full Access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Master Full Access" ON public.%I FOR ALL USING (public.is_master())', t);
        
        -- Admin policy: Full access (optional check)
        EXECUTE format('DROP POLICY IF EXISTS "Admin Full Access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Admin Full Access" ON public.%I FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''))', t);
        
        -- Default Authenticated policy: Read access (adjust per table as needed)
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated Read" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Authenticated Read" ON public.%I FOR SELECT TO authenticated USING (true)', t);
    END LOOP;
END $$;

-- 4. ENSURE MASTER USER HAS ROLE
-- Master Email: cesar.ascanio@gmail.com
-- We need to find the user_id from auth.users and insert/update it in user_roles

-- Note: In Supabase, you usually can't query auth.users directly from public schema without high privileges
-- but adding an entry to user_roles is safe.

INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'master', true
FROM auth.users
WHERE email = 'cesar.ascanio@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'master', is_active = true;

-- 5. ENSURE DEMO USER HAS ORGANIZATION & IS CONFIRMED
-- Demo Email: demo.medivisitpro@gmail.com
-- Org ID: d3300000-0000-0000-0000-000000000001

-- Confirmar email manualmente en auth.users
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    last_sign_in_at = NULL -- Reset to force first login flow if needed
WHERE email = 'demo.medivisitpro@gmail.com';

-- Asegurar rol y organización
INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
SELECT id, 'representative', 'd3300000-0000-0000-0000-000000000001', true
FROM auth.users
WHERE email = 'demo.medivisitpro@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
    organization_id = 'd3300000-0000-0000-0000-000000000001', 
    role = 'representative',
    is_active = true;

-- Actualizar metadata del usuario para consistencia
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"first_name": "Usuario", "last_name": "Demo", "organization_id": "d3300000-0000-0000-0000-000000000001", "role": "representative"}'::jsonb
WHERE email = 'demo.medivisitpro@gmail.com';
