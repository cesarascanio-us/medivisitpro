-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    interval text NOT NULL CHECK (interval IN ('month', 'year')),
    features text[] DEFAULT '{}',
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies for plans
CREATE POLICY "Public read plans" ON public.subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "Master manage plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND role = 'master')
    );

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subject text NOT NULL,
    description text,
    priority text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    user_id uuid REFERENCES auth.users(id),
    organization_id uuid REFERENCES public.organizations(id),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
-- Users can see their own tickets or tickets from their org (optional, but keep simple for now)
CREATE POLICY "Users view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Master can see and manage all tickets
CREATE POLICY "Master manage all tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles_plain WHERE user_id = auth.uid() AND role = 'master')
    );

-- Seed some initial data if empty
INSERT INTO public.subscription_plans (name, price, interval, features, active)
SELECT 'Básico', 29.99, 'month', to_jsonb(ARRAY['Gestión de Usuarios', 'Soporte Email']), true
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans);

INSERT INTO public.subscription_plans (name, price, interval, features, active)
SELECT 'Pro', 99.99, 'month', to_jsonb(ARRAY['Todo los de Básico', 'Reportes Avanzados', 'Soporte Prioritario']), true
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Pro');
