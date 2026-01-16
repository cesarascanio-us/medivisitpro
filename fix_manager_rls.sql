-- Script para permitir a Gerentes, Admins y Masters ver TODOS los datos en el Dashboard
-- 1. Política para VISITAS
-- Primero eliminamos políticas antiguas si existen para evitar conflictos
DROP POLICY IF EXISTS "Managers can view all visits" ON visits;
DROP POLICY IF EXISTS "Users can view own visits" ON visits;
-- (Nota: mantenemos la politica basica de ver lo propio, pero creamos una nueva mas amplia O inclusiva)
-- Política Permisiva: Si eres Manager/Admin/Master ves TODO. Si no, ves solo lo tuyo.
CREATE POLICY "Dashboard Access Policy - Visits" ON visits FOR
SELECT USING (
        (auth.uid() = user_id)
        OR EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role IN ('manager', 'admin', 'master')
        )
        OR -- Caso Supervisor: Ver visitas de sus representantes (opcional, pero buena práctica)
        EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'supervisor'
                AND EXISTS (
                    SELECT 1
                    FROM user_roles AS ur_rep
                    WHERE ur_rep.user_id = visits.user_id
                        AND ur_rep.supervisor_id = auth.uid()
                )
        )
    );
-- 2. Política para PEDIDOS (Transfer Orders)
DROP POLICY IF EXISTS "Managers can view all orders" ON transfer_orders;
CREATE POLICY "Dashboard Access Policy - Orders" ON transfer_orders FOR
SELECT USING (
        (auth.uid() = user_id)
        OR EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role IN ('manager', 'admin', 'master')
        )
        OR EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'supervisor'
                AND EXISTS (
                    SELECT 1
                    FROM user_roles AS ur_rep
                    WHERE ur_rep.user_id = transfer_orders.user_id
                        AND ur_rep.supervisor_id = auth.uid()
                )
        )
    );
-- 3. Asegurar acceso a user_roles para que las subqueries funcionen
CREATE POLICY "Read access for authenticated users" ON user_roles FOR
SELECT TO authenticated USING (true);