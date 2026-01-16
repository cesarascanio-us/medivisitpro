-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g. 'Pro', 'Enterprise'
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    interval TEXT CHECK (interval IN ('month', 'year')) DEFAULT 'month',
    features JSONB DEFAULT '[]', -- List of features
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Master Access
CREATE POLICY "Master full access plans" ON public.subscription_plans
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'master')
    );

-- Public Read Access (for pricing page)
CREATE POLICY "Public read plans" ON public.subscription_plans
    FOR SELECT TO authenticated USING (true);
