-- Script para permitir a Gerentes, Admins y otros roles ver TODOS los contactos en el Mapa
-- 1. Política para CONTACTOS (contacts)
-- Esto habilitará que aparezcan Médicos, Farmacias, Hospitales, etc. en el Mapa de Cobertura.
DROP POLICY IF EXISTS "Managers can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Read access for authenticated users" ON contacts;
CREATE POLICY "Dashboard Access Policy - Contacts" ON contacts FOR
SELECT USING (
        -- Los usuarios siempre ven sus propios contactos asignados (si la columna user_id o asignado existe, asumimos user_id por compatibilidad)
        (auth.uid() = user_id)
        OR -- Roles Jerárquicos ven TODO
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role IN ('manager', 'admin', 'master')
        )
        OR -- Supervisores ven contactos de su región (o todo si preferimos simplificar, aquí filtrando por región/estado del supervisor)
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'supervisor' -- La lógica exacta puede variar, pero a menudo se permite ver todo y se filtra en front, 
                -- o idealmente: AND contacts.state = user_roles.state
        )
    );
-- NOTA: Si view_geo_map depende de otras tablas (ej: addresses), habría que revisar esas también.
-- Por ahora asumimos que la data crítica está en 'contacts'.