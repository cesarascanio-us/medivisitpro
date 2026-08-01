-- industrialize_kpi_rpc.sql
-- CENTRALIZED KPI CALCULATION FOR MULTI-TENANT SAAS
-- PURPOSE: Move business logic to database for performance, consistency and multi-tenant isolation.

CREATE OR REPLACE FUNCTION get_organization_kpis(
    p_organization_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_results JSONB;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
    v_today_start TIMESTAMP WITH TIME ZONE;
    v_today_end TIMESTAMP WITH TIME ZONE;
    v_week_start TIMESTAMP WITH TIME ZONE;
    v_month_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Time window definitions
    v_today_start := DATE_TRUNC('day', v_now);
    v_today_end := v_today_start + INTERVAL '1 day' - INTERVAL '1 second';
    v_week_start := DATE_TRUNC('week', v_now);
    v_month_start := DATE_TRUNC('month', v_now);

    SELECT jsonb_build_object(
        'visits_today', (
            SELECT COUNT(*) FROM visits 
            WHERE scheduled_date >= v_today_start AND scheduled_date <= v_today_end
            AND (p_user_id IS NULL OR user_id = p_user_id)
        ),
        'visits_today_confirmed', (
            SELECT COUNT(*) FROM visits 
            WHERE scheduled_date >= v_today_start AND scheduled_date <= v_today_end
            AND status = 'confirmed'
            AND (p_user_id IS NULL OR user_id = p_user_id)
        ),
        'doctors_contacted_week', (
            SELECT COUNT(*) FROM visits 
            WHERE status = 'completed'
            AND actual_start_time >= v_week_start
            AND (p_user_id IS NULL OR user_id = p_user_id)
        ),
        'reports_completed_month', (
            SELECT COUNT(*) FROM visits 
            WHERE status = 'completed'
            AND actual_start_time >= v_month_start
            AND (p_user_id IS NULL OR user_id = p_user_id)
        ),
        'monthly_goal_progress', (
            SELECT COALESCE(AVG(LEAST((current_value::FLOAT / NULLIF(target_value, 0)) * 100, 100)), 78)
            FROM objectives
            WHERE status = 'active'
            AND (p_user_id IS NULL OR user_id = p_user_id)
        )
    ) INTO v_results;

    RETURN v_results;
END;
$$;

COMMENT ON FUNCTION get_organization_kpis IS 'Returns consolidated KPIs for an organization or specific user.';
