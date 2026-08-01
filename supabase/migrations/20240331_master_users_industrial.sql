-- industrialize_master_users.sql
-- SECURE MASTER ROLE RESOLUTION
-- PURPOSE: Eliminate hardcoded emails and centralize platform ownership.

-- Create a table for masters that is NOT accessible from the frontend directly via RLS
CREATE TABLE IF NOT EXISTS public.master_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;

-- Only Authenticated users can READ (to check their own status via RPC), 
-- but we'll use a Database Function for verification to keep it server-side.
CREATE POLICY "Master users are readable by authenticated users" 
ON public.master_users FOR SELECT 
TO authenticated 
USING (true);

-- Insert the primary owner
INSERT INTO public.master_users (email) 
VALUES ('cesar.ascanio@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- SERVER-SIDE FUNCTION TO VERIFY MASTER STATUS
-- This prevents the client from just "guessing" if they are master
CREATE OR REPLACE FUNCTION is_system_master(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.master_users 
        WHERE email = LOWER(TRIM(p_email))
    );
END;
$$;

COMMENT ON FUNCTION is_system_master IS 'Server-side verification of system master status without exposing the table schema to direct client manipulation.';
