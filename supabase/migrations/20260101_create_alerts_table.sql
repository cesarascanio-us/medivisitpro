-- System Alerts Table
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- Null for global alerts
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
    is_global BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Master Access
CREATE POLICY "Master full access alerts" ON public.system_alerts
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'master')
    );

-- User Read Access
CREATE POLICY "User read alerts" ON public.system_alerts
    FOR SELECT TO authenticated USING (
        (is_global = true AND active = true) OR
        (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND active = true)
    );
