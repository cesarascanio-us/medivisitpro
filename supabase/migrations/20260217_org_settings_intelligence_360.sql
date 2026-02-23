-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: 360 Intelligence Global Parameters
-- Sets default organizational parameters for safety stock, conversion, and geo-correlation.
-- 1. Update existing organizations with new default settings
UPDATE public.organizations
SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
        'safety_threshold_default',
        6,
        'conversion_factor_default',
        0.7,
        'geo_radius_attribution',
        1.5
    );
-- 2. Update view_gerencial_kpis to use these parameters
-- (Dropping first to allow column/logic changes)
DROP VIEW IF EXISTS public.view_gerencial_kpis CASCADE;
CREATE OR REPLACE VIEW public.view_gerencial_kpis AS WITH org_settings AS (
        SELECT id as organization_id,
            COALESCE(
                (settings->>'safety_threshold_default')::numeric,
                6
            ) as safety_threshold,
            COALESCE(
                (settings->>'conversion_factor_default')::numeric,
                0.7
            ) as conversion_factor
        FROM public.organizations
    ),
    month_data AS (
        SELECT o.organization_id,
            COALESCE(SUM(t.total), 0) as total_sales,
            COUNT(t.id) as total_orders
        FROM public.transfer_orders t
            JOIN public.profiles p ON t.user_id = p.user_id
            JOIN org_settings o ON p.organization_id = o.organization_id
        WHERE t.status != 'cancelled'
            AND date_trunc('month', t.created_at) = date_trunc('month', now())
        GROUP BY o.organization_id
    ),
    visit_data AS (
        SELECT p.organization_id,
            COUNT(v.id) as total_visits,
            COUNT(DISTINCT v.contact_id) as visited_contacts,
            COALESCE(SUM(v.compromiso_inicio), 0) as total_compromiso_raw,
            COUNT(v.id) FILTER (
                WHERE v.selling_points IS NOT NULL
                    AND v.selling_points != '{}'::jsonb
            ) as visits_with_message,
            COUNT(v.id) FILTER (
                WHERE v.trained_staff = TRUE
                    AND v.pop_visible = TRUE
                    AND v.visit_type = 'pharmacy'
            ) as healthy_pos_visits,
            COUNT(v.id) FILTER (
                WHERE v.visit_type = 'pharmacy'
            ) as total_pharmacy_visits
        FROM public.visits v
            JOIN public.profiles p ON v.user_id = p.user_id
        WHERE v.status = 'completed'
            AND date_trunc('month', v.scheduled_date) = date_trunc('month', now())
        GROUP BY p.organization_id
    ),
    total_contacts_data AS (
        SELECT organization_id,
            COUNT(id) as total_active_contacts
        FROM public.contacts
        GROUP BY organization_id
    )
SELECT s.organization_id,
    m.total_sales,
    CASE
        WHEN v.total_visits > 0 THEN (m.total_orders::float / v.total_visits::float) * 100
        ELSE 0
    END as visit_effectiveness,
    CASE
        WHEN c.total_active_contacts > 0 THEN (
            v.visited_contacts::float / c.total_active_contacts::float
        ) * 100
        ELSE 0
    END as portfolio_coverage,
    (v.total_compromiso_raw * s.conversion_factor) as proyected_prescriptions,
    CASE
        WHEN v.total_visits > 0 THEN (
            v.visits_with_message::float / v.total_visits::float
        ) * 100
        ELSE 0
    END as message_reach_rate,
    CASE
        WHEN v.total_pharmacy_visits > 0 THEN (
            v.healthy_pos_visits::float / v.total_pharmacy_visits::float
        ) * 100
        ELSE 0
    END as pos_health_index
FROM org_settings s
    LEFT JOIN month_data m ON s.organization_id = m.organization_id
    LEFT JOIN visit_data v ON s.organization_id = v.organization_id
    LEFT JOIN total_contacts_data c ON s.organization_id = c.organization_id;
-- 3. Update get_visit_impact_correlation to use geo_radius_attribution
CREATE OR REPLACE FUNCTION public.get_visit_impact_correlation(p_doctor_id UUID, p_radius_km FLOAT DEFAULT NULL) RETURNS TABLE (
        doctor_name TEXT,
        pharmacy_name TEXT,
        distance_km FLOAT,
        stock_risk BOOLEAN,
        samples_dropped TEXT
    ) AS $$
DECLARE v_radius FLOAT;
v_org_id UUID;
BEGIN -- Get org_id and radius from settings if not provided
SELECT organization_id INTO v_org_id
FROM public.contacts
WHERE id = p_doctor_id;
IF p_radius_km IS NULL THEN
SELECT COALESCE(
        (settings->>'geo_radius_attribution')::float,
        1.5
    ) INTO v_radius
FROM public.organizations
WHERE id = v_org_id;
ELSE v_radius := p_radius_km;
END IF;
RETURN QUERY
SELECT d.name as doctor_name,
    p.name as pharmacy_name,
    (
        ST_Distance(
            ST_SetSRID(ST_MakePoint(d.longitude, d.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography
        ) / 1000.0
    ) as distance_km,
    EXISTS (
        SELECT 1
        FROM public.registro_pvp_farmacia r
        WHERE r.pharmacy_id = p.id
            AND r.cantidad_actual < COALESCE(
                (o.settings->>'safety_threshold_default')::numeric,
                6
            )
            AND r.created_at > now() - interval '30 days'
    ) as stock_risk,
    (
        SELECT v.samples_delivered
        FROM public.visits v
        WHERE v.contact_id = d.id
            AND v.status = 'completed'
        ORDER BY v.scheduled_date DESC
        LIMIT 1
    ) as samples_dropped
FROM public.contacts d
    CROSS JOIN public.contacts p
    JOIN public.organizations o ON d.organization_id = o.id
WHERE d.id = p_doctor_id
    AND d.contact_type = 'doctor'
    AND p.contact_type = 'pharmacy'
    AND d.latitude IS NOT NULL
    AND d.longitude IS NOT NULL
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(d.longitude, d.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
        v_radius * 1000.0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 4. Re-grant permissions
GRANT SELECT ON public.view_gerencial_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_visit_impact_correlation TO authenticated;