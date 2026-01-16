-- =====================================================
-- DEFINITIVE FIX (v4): MANAGER ACCOUNT & CLEANUP
-- Date: 2026-01-02
-- Purpose: 
-- 1. Fix "relation auth_internal.user_roles_plain does not exist" (Legacy Trigger Cleanup)
-- 2. Create user for Manual Email Confirmation
-- =====================================================

-- [PHASE 1: AGGRESSIVE CLEANUP]
-- We must drop the OLD trigger and function first because they are blocking the inserts
DROP TRIGGER IF EXISTS trigger_sync_user_roles_plain ON public.user_roles;
DROP FUNCTION IF EXISTS public.sync_user_roles_plain() CASCADE;
DROP TABLE IF EXISTS public.user_roles_plain CASCADE;
DROP TABLE IF EXISTS auth_internal.user_roles_plain CASCADE;
DROP SCHEMA IF EXISTS auth_internal CASCADE;

-- [PHASE 2: NEW SECURITY CACHE]
CREATE TABLE public.user_roles_plain (
    user_id UUID PRIMARY KEY,
    role TEXT,
    organization_id UUID,
    is_org_admin BOOLEAN DEFAULT false,
    state TEXT,
    region TEXT,
    supervisor_id UUID,
    zone_id UUID
);

-- [PHASE 3: RE-CREATING THE MANAGER ACCOUNT]
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    org_id UUID := 'a0000000-0000-0000-0000-000000000001'; -- Biofarco
    user_email TEXT := 'cesarascanio.edu@gmail.com';
    user_pass TEXT := '123456';
BEGIN
    -- 1. Delete existing user (reset)
    DELETE FROM auth.users WHERE email = user_email;

    -- 2. Create the user 
    -- We leave email_confirmed_at as NULL so "Resend Email" works
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, 
        raw_app_meta_data, raw_user_meta_data, 
        is_super_admin, role, aud, created_at, updated_at,
        email_confirmed_at
    )
    VALUES (
        new_user_id, '00000000-0000-0000-0000-000000000000', user_email, 
        crypt(user_pass, gen_salt('bf')), 
        '{"provider":"email","providers":["email"]}', '{"first_name":"Gerente","last_name":"Biofarco"}',
        false, 'authenticated', 'authenticated', now(), now(),
        NULL
    );

    -- 3. Create the identity (Strictly following Supabase provider_id requirements)
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    )
    VALUES (
        new_user_id, new_user_id, 
        format('{"sub":"%s","email":"%s"}', new_user_id, user_email)::jsonb, 
        'email', new_user_id,
        now(), now(), now()
    );

    -- 4. Create Profile
    INSERT INTO public.profiles (id, user_id, first_name, last_name, email, organization_id, is_org_admin)
    VALUES (new_user_id, new_user_id, 'Gerente', 'Biofarco', user_email, org_id, true);

    -- 5. Assign Role (This will NOT trigger the old function anymore)
    INSERT INTO public.user_roles (user_id, role, organization_id)
    VALUES (new_user_id, 'manager', org_id);

    -- 6. Update Security Cache
    INSERT INTO public.user_roles_plain (user_id, role, organization_id, is_org_admin)
    VALUES (new_user_id, 'manager', org_id, true);

    RAISE NOTICE 'Manager created successfully. Email: %, ID: %', user_email, new_user_id;
    RAISE NOTICE 'Now go to Supabase Auth > Users and click "Resend confirmation email"';
END $$;

-- [PHASE 4: NEW SECURE FUNCTIONS]
CREATE OR REPLACE FUNCTION public.get_my_organization_id() RETURNS UUID SECURITY DEFINER AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT SECURITY DEFINER AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Sync rest of the team
INSERT INTO public.user_roles_plain (user_id, role, organization_id)
SELECT user_id, role, organization_id FROM public.user_roles
ON CONFLICT (user_id) DO NOTHING;

-- [PHASE 5: NEW SYNC TRIGGER]
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain() 
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.user_roles_plain (user_id, role, organization_id, state, region, supervisor_id, zone_id)
    VALUES (NEW.user_id, NEW.role, NEW.organization_id, NEW.state, NEW.region, NEW.supervisor_id, NEW.zone_id)
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        organization_id = EXCLUDED.organization_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_user_roles_plain
    AFTER INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

-- [PHASE 6: RLS POLICIES]
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Global Profile Access" ON public.profiles;
CREATE POLICY "Global Profile Access" ON public.profiles FOR ALL USING (
    user_id = auth.uid() OR
    organization_id::text = (SELECT organization_id::text FROM public.user_roles_plain WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Global Role Access" ON public.user_roles;
CREATE POLICY "Global Role Access" ON public.user_roles FOR ALL USING (
    user_id = auth.uid() OR
    organization_id::text = (SELECT organization_id::text FROM public.user_roles_plain WHERE user_id = auth.uid())
);

-- [PHASE 7: PERMISSIONS]
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT SELECT ON public.user_roles_plain TO anon, authenticated, authenticator;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
