-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Advanced Geo-Strategic Correlation (Efecto Espejo)
-- Description: Updates the correlation function to include commitment values and precise stock counts for "Fuga de Ventas" calculation.
-- Date: 2026-02-17
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
    ) AS $$ BEGIN RETURN QUERY WITH latest_doctor_visit AS (
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
    ),
    active_pharmacy_stock AS (
        SELECT r.pharmacy_id,
            COALESCE(SUM(r.cantidad_actual), 0) as stock_total
        FROM public.registro_pvp_farmacia r
        WHERE r.created_at > now() - interval '45 days'
        GROUP BY r.pharmacy_id
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
    COALESCE(s.stock_total, 0) as current_stock
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
    AND d.organization_id = get_my_organization_id()
    AND p.organization_id = get_my_organization_id()
    AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(d.longitude, d.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
        p_radius_km * 1000.0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;