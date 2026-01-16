-- FIX: Disable redundant trigger that conflicts with RPC
-- The RPC 'create_new_user' already handles profile creation.
-- Having a trigger 'on_auth_user_created' creates a race condition/double-insert.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Also ensure user_roles has the correct RLS for the Supervisor
-- (Re-applying the 'is_active' fix just in case it wasn't picked up by the context)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_active') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
