-- Migration: Fix Multi-Tenant Isolation in Geo-Correlation
-- Description: Ensures get_visit_impact_correlation only returns pharmacies within the SAME organization as the doctor.
-- Date: 2026-02-17
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
            AND v.organization_id = d.organization_id -- Tenant Isolation
        ORDER BY v.scheduled_date DESC
        LIMIT 1
    ) as samples_dropped
FROM public.contacts d
    INNER JOIN public.contacts p ON p.organization_id = d.organization_id -- MANDATORY TENANT ISOLATION
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