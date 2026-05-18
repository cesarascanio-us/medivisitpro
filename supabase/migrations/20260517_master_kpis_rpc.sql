-- =================================================================
-- RPC: get_master_kpis
-- Solo ejecutable por usuarios con rol 'master' o 'admin'
-- Retorna KPIs globales cross-organization para el Dashboard Master
-- =================================================================

CREATE OR REPLACE FUNCTION get_master_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result json;
BEGIN
  -- Solo permite ejecutar si el usuario tiene rol master
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('master', 'admin')
  ) THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  SELECT json_build_object(
    'total_organizations', (SELECT COUNT(*) FROM organizations),
    'total_users',         (SELECT COUNT(*) FROM profiles),
    'total_visits_month',  (SELECT COUNT(*) FROM visits
                            WHERE checkin_at >= date_trunc('month', now())),
    'total_transfers',     (SELECT COUNT(*) FROM transfer_orders
                            WHERE created_at >= date_trunc('month', now())),
    'organizations_activity', (
      SELECT json_agg(t) FROM (
        SELECT o.name as name, COUNT(v.id)::int as visits
        FROM organizations o
        LEFT JOIN visits v ON v.organization_id = o.id
        GROUP BY o.id, o.name
        ORDER BY visits DESC
        LIMIT 5
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;
