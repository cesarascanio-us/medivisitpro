-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- RLS Enhancement: Comprehensive Data Scope Visibility
-- Date: 2026-01-02
-- Version: 3.0 (Hierarchical & Regional Scope)
-- =====================================================

-- 1. Helper Function: Get user's assigned state
CREATE OR REPLACE FUNCTION public.get_my_state()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((SELECT state FROM public.user_roles WHERE user_id::text = auth.uid()::text LIMIT 1), '');
$$;

-- Add state and region to profiles if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='state') THEN
        ALTER TABLE profiles ADD COLUMN state TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='region') THEN
        ALTER TABLE profiles ADD COLUMN region TEXT;
    END IF;
END $$;

-- 2. Helper Function: Get user's assigned region
CREATE OR REPLACE FUNCTION public.get_my_region()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((SELECT region FROM public.user_roles WHERE user_id::text = auth.uid()::text LIMIT 1), '');
$$;

-- 3. Utility Function: Check if a user is a subordinate of the current user
CREATE OR REPLACE FUNCTION public.is_subordinate(target_user_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id::text = target_user_id::text 
        AND supervisor_id::text = auth.uid()::text
    );
$$;

-- =====================================================
-- DOCTORS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Org Doctors Access Enhanced" ON doctors;
CREATE POLICY "Org Doctors Access Enhanced" ON doctors
    FOR ALL USING (
        organization_id::text = get_my_organization_id()::text AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                state = get_my_state() OR 
                is_subordinate(user_id) OR
                user_id::text = auth.uid()::text
            )) OR
            (get_my_role() = 'representative' AND (
                user_id::text = auth.uid()::text OR 
                representative_id::text = auth.uid()::text
            ))
        )
    );

-- =====================================================
-- PHARMACIES RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Org Pharmacies Access Enhanced" ON pharmacies;
CREATE POLICY "Org Pharmacies Access Enhanced" ON pharmacies
    FOR ALL USING (
        organization_id::text = get_my_organization_id()::text AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                state = get_my_state() OR 
                is_subordinate(user_id) OR
                user_id::text = auth.uid()::text
            )) OR
            (get_my_role() = 'representative' AND (
                user_id::text = auth.uid()::text OR 
                representative_id::text = auth.uid()::text
            ))
        )
    );

-- =====================================================
-- VISITS RLS POLICIES
-- =====================================================

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Visits Access" ON visits;
CREATE POLICY "Org Visits Access" ON visits
    FOR ALL USING (
        (organization_id::text = get_my_organization_id()::text OR company_id::text = get_my_organization_id()::text) AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                is_subordinate(user_id) OR
                user_id::text = auth.uid()::text
            )) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    );

-- =====================================================
-- TRANSFER ORDERS RLS POLICIES
-- =====================================================

ALTER TABLE IF EXISTS transfer_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Transfer Orders Access" ON transfer_orders;
CREATE POLICY "Org Transfer Orders Access" ON transfer_orders
    FOR ALL USING (
        organization_id::text = get_my_organization_id()::text AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                is_subordinate(user_id) OR
                user_id::text = auth.uid()::text
            )) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    );

-- =====================================================
-- CONTACTS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Org Contact Access Enhanced" ON contacts;
CREATE POLICY "Org Contact Access Enhanced" ON contacts
    FOR ALL USING (
        organization_id::text = get_my_organization_id()::text AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                state = get_my_state() OR 
                is_subordinate(user_id) OR
                user_id::text = auth.uid()::text
            )) OR
            (get_my_role() = 'representative' AND user_id::text = auth.uid()::text)
        )
    );

-- =====================================================
-- ZONES RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Org Zones Access" ON zones;
CREATE POLICY "Org Zones Access" ON zones
    FOR ALL USING (
        organization_id::text = get_my_organization_id()::text AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                state = get_my_state() OR
                id IN (SELECT zone_id FROM user_roles WHERE supervisor_id::text = auth.uid()::text) OR
                id::text = get_my_zone_id()::text
            )) OR
            (get_my_role() = 'representative' AND id::text = get_my_zone_id()::text)
        )
    );

-- =====================================================
-- HEALTH CENTERS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Org Health Centers Access Enhanced" ON health_centers;
CREATE POLICY "Org Health Centers Access Enhanced" ON health_centers
    FOR ALL USING (
        organization_id::text = get_my_organization_id()::text AND (
            get_my_role() IN ('master', 'admin', 'manager') OR
            (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                state = get_my_state() OR 
                is_subordinate(user_id) OR
                user_id::text = auth.uid()::text
            )) OR
            (get_my_role() = 'representative' AND (
                user_id::text = auth.uid()::text
            ))
        )
    );

-- =====================================================
-- USER ROLES RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Org User Roles Access" ON user_roles;
CREATE POLICY "Org User Roles Access" ON user_roles
    FOR ALL USING (
        user_id::text = auth.uid()::text OR
        (
            organization_id::text = get_my_organization_id()::text AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                is_subordinate(user_id)
            )
        )
    );

-- =====================================================
-- PROFILES RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Profiles org isolation" ON profiles;
CREATE POLICY "Profiles org isolation" ON profiles
    FOR SELECT USING (
        user_id::text = auth.uid()::text OR
        (
            organization_id::text = get_my_organization_id()::text AND (
                get_my_role() IN ('master', 'admin', 'manager') OR
                is_subordinate(user_id) OR
                -- Supervisors can see all profiles in their state/region too
                (get_my_role() IN ('supervisor', 'chief', 'coordinator') AND (
                    state = get_my_state() OR 
                    region = get_my_region()
                ))
            )
        )
    );
