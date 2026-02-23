-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Create view_next_best_action to fix 404 error on Dashboard
-- Matches interface NextBestAction in SmartAssistant.tsx
DROP VIEW IF EXISTS public.view_next_best_action CASCADE;
CREATE OR REPLACE VIEW public.view_next_best_action AS WITH last_visits AS (
        SELECT contact_id,
            MAX(scheduled_date) as last_visit_date
        FROM public.visits
        WHERE status = 'completed'
        GROUP BY contact_id
    ),
    doctor_actions AS (
        SELECT c.id,
            'doctor'::text as entity_type,
            c.name,
            c.specialty,
            'High'::text as potential,
            -- Mock/Default
            c.address,
            lv.last_visit_date as last_visit,
            COALESCE(
                EXTRACT(
                    DAY
                    FROM (NOW() - lv.last_visit_date)
                ),
                999
            )::integer as days_since_visit,
            0 as sales_drop_percent,
            -- Mock
            CASE
                WHEN lv.last_visit_date IS NULL THEN 90
                WHEN EXTRACT(
                    DAY
                    FROM (NOW() - lv.last_visit_date)
                ) > 30 THEN 80
                ELSE 50
            END as score,
            CASE
                WHEN lv.last_visit_date IS NULL THEN 'Never visited'
                WHEN EXTRACT(
                    DAY
                    FROM (NOW() - lv.last_visit_date)
                ) > 30 THEN 'Overdue visit'
                ELSE 'Routine check'
            END as reason,
            CASE
                WHEN lv.last_visit_date IS NULL THEN 'critical'
                WHEN EXTRACT(
                    DAY
                    FROM (NOW() - lv.last_visit_date)
                ) > 30 THEN 'urgent'
                ELSE 'routine'
            END as mission_type,
            c.user_id
        FROM public.contacts c
            LEFT JOIN last_visits lv ON c.id = lv.contact_id -- WHERE c.status = 'active' -- Removed: Column does not exist
    )
SELECT id,
    entity_type,
    name,
    specialty,
    potential,
    address,
    last_visit,
    days_since_visit,
    sales_drop_percent,
    score,
    reason,
    mission_type,
    user_id
FROM doctor_actions;
-- Grant access
GRANT SELECT ON public.view_next_best_action TO authenticated;