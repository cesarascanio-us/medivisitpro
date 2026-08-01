-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

create table if not exists public.subscriptions (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) not null,
    status text not null,
    -- 'active', 'past_due', 'paused', 'cancelled', 'expired'
    plan_variant_id text not null,
    -- LemonSqueezy Variant ID
    provider_subscription_id text not null,
    -- LemonSqueezy Subscription ID
    current_period_end timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
-- Add RLS policies
alter table public.subscriptions enable row level security;
create policy "Users can view subscriptions for their organization" on public.subscriptions for
select using (
        exists (
            select 1
            from public.user_roles ur
            where ur.user_id = auth.uid()
                and ur.organization_id = public.subscriptions.organization_id
        )
        or exists (
            select 1
            from public.profiles p
            where p.user_id = auth.uid()
                and p.organization_id = public.subscriptions.organization_id
        )
    );
-- Only service role can insert/update (via webhook)
create policy "Service role can manage subscriptions" on public.subscriptions using (auth.jwt()->>'role' = 'service_role');