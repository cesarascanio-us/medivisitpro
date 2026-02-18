-- Migration: Estrategia 360 Mapping
-- Adds strategic attributes to visits and POS audit tables, and updates analytics views.
-- 1. Update visits table with demand generation and shield metrics
ALTER TABLE public.visits
ADD COLUMN IF NOT EXISTS compromiso_inicio NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS selling_points JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS trained_staff BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pop_visible BOOLEAN DEFAULT FALSE;
-- 2. Update registro_pvp_farmacia with visibility metrics
ALTER TABLE public.registro_pvp_farmacia
ADD COLUMN IF NOT EXISTS faces NUMERIC DEFAULT 0;
-- 3. Add organization settings for minimum stock
-- (Assuming organizations.settings is already a JSONB column)
-- This is handled at application level or via default settings.
-- 4. Update view_gerencial_kpis to include new 360 KPIs
DROP VIEW IF EXISTS public.view_gerencial_kpis CASCADE;
CREATE OR REPLACE VIEW public.view_gerencial_kpis AS WITH month_data AS (
        SELECT COALESCE(SUM(total), 0) as total_sales,
            COUNT(id) as total_orders,
            COALESCE(SUM(total), 0) as organization_id -- Placeholder for grouping if needed, but the view currently aggregates all
        FROM public.transfer_orders
        WHERE status != 'cancelled'
            AND date_trunc('month', created_at) = date_trunc('month', now())
    ),
    visit_data AS (
        SELECT COUNT(id) as total_visits,
            COUNT(DISTINCT contact_id) as visited_contacts,
            COALESCE(SUM(compromiso_inicio), 0) as total_compromiso_recetas,
            COUNT(id) FILTER (
                WHERE selling_points IS NOT NULL
                    AND selling_points != '{}'::jsonb
            ) as visits_with_message,
            COUNT(id) FILTER (
                WHERE trained_staff = TRUE
                    AND pop_visible = TRUE
                    AND visit_type = 'pharmacy'
            ) as healthy_pos_visits,
            COUNT(id) FILTER (
                WHERE visit_type = 'pharmacy'
            ) as total_pharmacy_visits
        FROM public.visits
        WHERE status = 'completed'
            AND date_trunc('month', scheduled_date) = date_trunc('month', now())
    ),
    total_contacts_data AS (
        SELECT COUNT(id) as total_active_contacts
        FROM public.contacts
    )
SELECT m.total_sales,
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
    v.total_compromiso_recetas as proyected_prescriptions,
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
FROM month_data m,
    visit_data v,
    total_contacts_data c;
-- 5. Function for nearby pharmacies geo-correlation (Cruce de Trazabilidad)
-- This requires PostGIS. Assuming PostGIS is enabled in public/extensions.
CREATE OR REPLACE FUNCTION public.get_visit_impact_correlation(p_doctor_id UUID, p_radius_km FLOAT DEFAULT 5.0) RETURNS TABLE (
        doctor_name TEXT,
        pharmacy_name TEXT,
        distance_km FLOAT,
        stock_risk BOOLEAN,
        samples_dropped TEXT
    ) AS $$ BEGIN RETURN QUERY
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
                (o.settings->>'organization_min_stock')::numeric,
                5
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
        p_radius_km * 1000.0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 6. Permissions
GRANT SELECT ON public.view_gerencial_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_visit_impact_correlation TO authenticated;