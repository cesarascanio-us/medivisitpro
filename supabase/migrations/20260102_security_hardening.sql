-- =====================================================
-- SECURITY HARDENING - MediVisitPro
-- Date: 2026-01-02
-- Resolves: 1 Error (RLS in Public) and 7 Warnings (Search Path Mutable)
-- =====================================================

-- 1. CREATE PRIVATE SCHEMA FOR AUTH CACHE
CREATE SCHEMA IF NOT EXISTS auth_internal;

-- 2. MOVE AND RECREATE CACHE TABLE (Hides it from Security Advisor 'Public' check)
DROP TABLE IF EXISTS public.user_roles_plain CASCADE;

CREATE TABLE auth_internal.user_roles_plain (
    user_id UUID PRIMARY KEY,
    role TEXT NOT NULL,
    organization_id UUID,
    zone_id UUID,
    state TEXT,
    region TEXT,
    supervisor_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SYNC TRIGGER (Updated for new schema)
CREATE OR REPLACE FUNCTION public.sync_user_roles_plain()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM auth_internal.user_roles_plain WHERE user_id = OLD.user_id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
        INSERT INTO auth_internal.user_roles_plain (user_id, role, organization_id, zone_id, state, region, supervisor_id, updated_at)
        VALUES (
            NEW.user_id, 
            NEW.role, 
            NEW.organization_id, 
            NEW.zone_id,
            CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='state') THEN NEW.state ELSE NULL END,
            CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='region') THEN NEW.region ELSE NULL END,
            CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='supervisor_id') THEN NEW.supervisor_id ELSE NULL END,
            NEW.updated_at
        )
        ON CONFLICT (user_id) DO UPDATE 
        SET 
            role = EXCLUDED.role, 
            organization_id = EXCLUDED.organization_id,
            zone_id = EXCLUDED.zone_id,
            state = EXCLUDED.state,
            region = EXCLUDED.region,
            supervisor_id = EXCLUDED.supervisor_id,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth_internal;

DROP TRIGGER IF EXISTS trigger_sync_user_roles_plain ON public.user_roles;
CREATE TRIGGER trigger_sync_user_roles_plain
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_plain();

-- 4. INITIAL SYNC
INSERT INTO auth_internal.user_roles_plain (user_id, role, organization_id, zone_id, state, region, supervisor_id, updated_at)
SELECT 
    user_id, 
    role, 
    organization_id, 
    zone_id,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='state') THEN state ELSE NULL END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='region') THEN region ELSE NULL END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='supervisor_id') THEN supervisor_id ELSE NULL END,
    updated_at
FROM public.user_roles;

-- 5. SECURE HELPER FUNCTIONS (Explicit Search Path fixes Mutable Warnings)
CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM auth_internal.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = auth_internal;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM auth_internal.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = auth_internal;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS UUID AS $$
    SELECT zone_id FROM auth_internal.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = auth_internal;

CREATE OR REPLACE FUNCTION public.get_my_state()
RETURNS TEXT AS $$
    SELECT COALESCE(state, '') FROM auth_internal.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = auth_internal;

CREATE OR REPLACE FUNCTION public.get_my_region()
RETURNS TEXT AS $$
    SELECT COALESCE(region, '') FROM auth_internal.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = auth_internal;

CREATE OR REPLACE FUNCTION public.is_subordinate(target_user_id uuid)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM auth_internal.user_roles_plain 
        WHERE user_id = target_user_id 
        AND (supervisor_id = auth.uid() OR supervisor_id IN (SELECT user_id FROM auth_internal.user_roles_plain WHERE supervisor_id = auth.uid()))
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = auth_internal;

-- 6. RE-APPLY POLICIES FOR CLEANLINESS
DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;
CREATE POLICY "Org User Roles Access" ON user_roles
    FOR ALL USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            user_id::text = auth.uid()::text OR
            is_subordinate(user_id)
        )
    );

DROP POLICY IF EXISTS "Profiles org isolation" ON profiles;
CREATE POLICY "Profiles org isolation" ON profiles
    FOR SELECT USING (
        organization_id = get_my_organization_id() AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            user_id::text = auth.uid()::text OR
            is_subordinate(user_id) OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                state = get_my_state() OR 
                region = get_my_region()
            ))
        )
    );
