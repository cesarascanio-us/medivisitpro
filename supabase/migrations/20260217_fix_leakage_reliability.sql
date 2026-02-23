-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Sales Leakage (Fuga de Ventas) Reliability Update
-- Description: Adds unique constraints to audits and fixes the stock aggregation logic to avoid overcounting.
-- Date: 2026-02-17
-- 1. Add Unique Constraint to registro_pvp_farmacia
-- This prevents duplicate audit rows for the same product within a single visit.
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'idx_unique_visit_product_audit'
) THEN
ALTER TABLE public.registro_pvp_farmacia
ADD CONSTRAINT idx_unique_visit_product_audit UNIQUE (visit_id, producto_id);
END IF;
END $$;
-- 2. Refine Sales Leakage Calculation Function
-- Improved to take only the LATEST stock record per product per pharmacy, 
-- instead of summing all historical records within the time window.
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
    latest_product_stock AS (
        -- Get the most recent stock level for EACH product in EACH pharmacy
        SELECT r.pharmacy_id,
            r.producto_id,
            r.cantidad_actual,
            ROW_NUMBER() OVER (
                PARTITION BY r.pharmacy_id,
                r.producto_id
                ORDER BY r.created_at DESC
            ) as rn
        FROM public.registro_pvp_farmacia r
        WHERE r.created_at > now() - interval '45 days'
    ),
    active_pharmacy_stock AS (
        -- Sum only the latest levels
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