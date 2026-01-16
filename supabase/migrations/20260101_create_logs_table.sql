-- Create system_audit_logs table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,          -- e.g., 'login', 'create_user', 'delete_order'
    entity TEXT,                   -- e.g., 'auth', 'users', 'orders'
    details JSONB DEFAULT '{}',    -- Extra metadata
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Master can view all logs
CREATE POLICY "Master can view all logs" ON public.system_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'master'
        )
    );

-- System functionality (triggers/functions) can insert logs
-- But users themselves shouldn't manually insert unless via specific RPC or edge case.
-- Allowing insert for authenticated users for now to enable client-side logging of important actions if needed,
-- but typically this should be handled by database triggers.
CREATE POLICY "Users can insert logs" ON public.system_audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);
