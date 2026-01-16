-- Module 43: User Creation RPC (Bypassing Edge Functions)

-- 1. Ensure pgcrypto is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the RPC function
CREATE OR REPLACE FUNCTION create_new_user(
    email TEXT,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    p_role TEXT,
    zone_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS '
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
    caller_role TEXT;
BEGIN
    -- 1. Security Check: Only Master/Admin/Manager can execute HIGH LEVEL
    -- We can check the calling user''s role from public.user_roles
    SELECT role INTO caller_role
    FROM public.user_roles
    WHERE user_id = auth.uid();

    IF caller_role NOT IN (''master'', ''admin'', ''manager'', ''supervisor'') THEN
        RAISE EXCEPTION ''Unauthorized: Only admins/managers can create users.'';
    END IF;

    -- 2. Generate Hash
    encrypted_pw := crypt(password, gen_salt(''bf''));

    -- 3. Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        ''00000000-0000-0000-0000-000000000000'',
        gen_random_uuid(),
        ''authenticated'',
        ''authenticated'',
        email,
        encrypted_pw,
        now(),
        ''{"provider": "email", "providers": ["email"]}'',
        jsonb_build_object(''first_name'', first_name, ''last_name'', last_name, ''role'', p_role),
        now(),
        now(),
        '''',
        ''''
    )
    RETURNING id INTO new_user_id;

    -- 4. Insert into public.profiles
    INSERT INTO public.profiles (user_id, first_name, last_name, email)
    VALUES (new_user_id, first_name, last_name, email)
    ON CONFLICT (user_id) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;

    -- 5. Insert into public.user_roles
    INSERT INTO public.user_roles (user_id, role, zone_id, is_active)
    VALUES (new_user_id, p_role, zone_id, true)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        zone_id = EXCLUDED.zone_id,
        is_active = EXCLUDED.is_active;

    RETURN jsonb_build_object(''id'', new_user_id, ''email'', email);
END;
';
