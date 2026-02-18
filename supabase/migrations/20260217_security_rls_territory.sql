-- Migration: Security Hardening & Territory Isolation
-- Description: Secures registro_pvp_farmacia RLS and enforces territory isolation in Sales Leakage functions.
-- Date: 2026-02-17
-- 0. Enable PostGIS Extension (Required for Geography types)
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
-- 1. Helper Function: get_my_zone_id (If not exists)
CREATE OR REPLACE FUNCTION public.get_my_zone_id() RETURNS UUID AS $$
SELECT zone_id
FROM public.user_roles_plain
WHERE user_id = auth.uid()
LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;
-- 2. Secure registro_pvp_farmacia RLS
-- Replacing the insecure "USING (true)" policy with multi-tenant and territory-aware policies.
ALTER TABLE public.registro_pvp_farmacia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read access auth_rpf" ON public.registro_pvp_farmacia;
DROP POLICY IF EXISTS "Org Territory Audit Access" ON public.registro_pvp_farmacia;
CREATE POLICY "Org Territory Audit Access" ON public.registro_pvp_farmacia FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.contacts c
            WHERE c.id = pharmacy_id
                AND c.organization_id = get_my_organization_id()
                AND (
                    get_my_role() IN ('master', 'admin', 'manager')
                    OR (
                        get_my_role() = 'supervisor'
                        AND c.zone_id = get_my_zone_id()
                    )
                    OR (
                        get_my_role() = 'representative'
                        AND c.user_id::text = auth.uid()::text
                    )
                )
        )
    );
DROP POLICY IF EXISTS "Full access admin_rpf" ON public.registro_pvp_farmacia;
DROP POLICY IF EXISTS "Audit Management Access" ON public.registro_pvp_farmacia;
CREATE POLICY "Audit Management Access" ON public.registro_pvp_farmacia FOR ALL TO authenticated USING (
    get_my_role() IN ('master', 'admin', 'manager')
    AND EXISTS (
        SELECT 1
        FROM public.contacts c
        WHERE c.id = pharmacy_id
            AND c.organization_id = get_my_organization_id()
    )
) WITH CHECK (
    get_my_role() IN ('master', 'admin', 'manager')
    AND EXISTS (
        SELECT 1
        FROM public.contacts c
        WHERE c.id = pharmacy_id
            AND c.organization_id = get_my_organization_id()
    )
);
-- 3. Refine get_visit_impact_correlation with Isolation logic
-- This function is SECURITY DEFINER, so we MUST manually enforce the user's territory scope.
CREATE OR REPLACE FUNCTION public.get_visit_impact_correlation(
        p_doctor_id TEXT DEFAULT 'all',
        p_radius_km FLOAT DEFAULT 5.0
    ) RETURNS TABLE (
        doctor_id UUID,
        doctor_name TEXT,
        pharmacy_name TEXT,
        distance_km FLOAT,
        stock_risk BOOLEAN,
        samples_dropped TEXT,
        compromiso_proyectado NUMERIC,
        current_stock NUMERIC
    ) AS $$
DECLARE v_user_role TEXT;
v_user_org UUID;
v_user_zone UUID;
BEGIN -- 1. Get security context
v_user_role := get_my_role();
v_user_org := get_my_organization_id();
v_user_zone := get_my_zone_id();
RETURN QUERY WITH latest_doctor_visit AS (
    SELECT v.contact_id,
        v.samples_delivered,
        v.compromiso_inicio,
        ROW_NUMBER() OVER (
            PARTITION BY v.contact_id
            ORDER BY v.scheduled_date DESC
        ) as rn
    FROM public.visits v
    WHERE v.status = 'completed'
        AND v.visit_type = 'doctor'
        AND v.organization_id = v_user_org
        AND (
            v_user_role IN ('master', 'admin', 'manager')
            OR (
                v_user_role = 'supervisor'
                AND v.zone_id = v_user_zone
            )
            OR (
                v_user_role = 'representative'
                AND v.user_id::text = auth.uid()::text
            )
        )
),
latest_product_stock AS (
    SELECT r.pharmacy_id,
        r.producto_id,
        r.cantidad_actual,
        ROW_NUMBER() OVER (
            PARTITION BY r.pharmacy_id,
            r.producto_id
            ORDER BY r.created_at DESC
        ) as rn
    FROM public.registro_pvp_farmacia r
        JOIN public.contacts c ON r.pharmacy_id = c.id
    WHERE r.created_at > now() - interval '45 days'
        AND c.organization_id = v_user_org
        AND (
            v_user_role IN ('master', 'admin', 'manager')
            OR (
                v_user_role = 'supervisor'
                AND c.zone_id = v_user_zone
            )
            OR (
                v_user_role = 'representative'
                AND c.user_id::text = auth.uid()::text
            )
        )
),
active_pharmacy_stock AS (
    SELECT lps.pharmacy_id,
        COALESCE(SUM(lps.cantidad_actual), 0) as stock_total
    FROM latest_product_stock lps
    WHERE lps.rn = 1
    GROUP BY lps.pharmacy_id
)
SELECT d.id as doctor_id,
    d.name as doctor_name,
    p.name as pharmacy_name,
    (
        ST_Distance(
            ST_SetSRID(ST_MakePoint(d.longitude, d.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography
        ) / 1000.0
    ) as distance_km,
    (
        COALESCE(s.stock_total, 0) < COALESCE(
            (o.settings->>'organization_min_stock')::numeric,
            5
        )
    ) as stock_risk,
    v.samples_delivered as samples_dropped,
    COALESCE(v.compromiso_inicio, 0) as compromiso_proyectado,
    COALESCE(s.stock_total, 0)::numeric as current_stock
FROM public.contacts d
    CROSS JOIN public.contacts p
    JOIN public.organizations o ON d.organization_id = o.id
    LEFT JOIN latest_doctor_visit v ON v.contact_id = d.id
    AND v.rn = 1
    LEFT JOIN active_pharmacy_stock s ON s.pharmacy_id = p.id
WHERE (
        p_doctor_id = 'all'
        OR d.id::text = p_doctor_id
    )
    AND d.contact_type = 'doctor'
    AND p.contact_type = 'pharmacy'
    AND d.latitude IS NOT NULL
    AND d.longitude IS NOT NULL
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND d.organization_id = v_user_org
    AND p.organization_id = v_user_org -- Isolation at query level
    AND (
        v_user_role IN ('master', 'admin', 'manager')
        OR (
            v_user_role = 'supervisor'
            AND d.zone_id = v_user_zone
            AND p.zone_id = v_user_zone
        )
        OR (
            v_user_role = 'representative'
            AND d.user_id::text = auth.uid()::text
            AND p.user_id::text = auth.uid()::text
        )
    )
    AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(d.longitude, d.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
        p_radius_km * 1000.0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public,
    extensions;