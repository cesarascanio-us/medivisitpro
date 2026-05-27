-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Trigger para conectar visits con promotional_cycles
-- ========================================================================

CREATE OR REPLACE FUNCTION update_cycle_visits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_cycle_id UUID;
BEGIN
  -- Buscar el ciclo promocional activo (asumimos 1 activo global o manejado por RLS)
  SELECT id INTO active_cycle_id
  FROM promotional_cycles
  WHERE status = 'active'
  LIMIT 1;

  -- Solo proceder si hay un ciclo activo
  IF active_cycle_id IS NOT NULL THEN
    -- Si es INSERT y la visita está completada
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
      UPDATE promotional_cycles
      SET current_visits = COALESCE(current_visits, 0) + 1
      WHERE id = active_cycle_id;

    -- Si es UPDATE a status 'completed'
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
      UPDATE promotional_cycles
      SET current_visits = COALESCE(current_visits, 0) + 1
      WHERE id = active_cycle_id;

    -- Si es UPDATE quitando el status 'completed'
    ELSIF (TG_OP = 'UPDATE' AND NEW.status != 'completed' AND OLD.status = 'completed') THEN
      UPDATE promotional_cycles
      SET current_visits = GREATEST(0, COALESCE(current_visits, 0) - 1)
      WHERE id = active_cycle_id;

    -- Si es DELETE y estaba completada
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'completed') THEN
      UPDATE promotional_cycles
      SET current_visits = GREATEST(0, COALESCE(current_visits, 0) - 1)
      WHERE id = active_cycle_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_cycle_visits ON visits;
CREATE TRIGGER trigger_update_cycle_visits
AFTER INSERT OR UPDATE OR DELETE ON visits
FOR EACH ROW EXECUTE FUNCTION update_cycle_visits();
