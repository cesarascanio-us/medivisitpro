-- Migración para añadir políticas de seguridad (RLS) para aprobadores de eventos

-- Permitir a los gerentes, supervisores y master ver y actualizar los eventos de su equipo
CREATE POLICY "Managers can view and update team events" ON events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles mgr
    JOIN user_roles rep ON mgr.organization_id = rep.organization_id
    WHERE mgr.user_id = auth.uid()
    AND mgr.role IN ('supervisor', 'manager', 'chief', 'master')
    AND rep.user_id = events.user_id
  )
);
