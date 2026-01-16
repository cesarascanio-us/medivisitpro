-- Allow users to manage their own inventory (Insert/Update/Delete)
-- Date: 2026-01-11
DROP POLICY IF EXISTS "Self management auth_im" ON public.inventario_muestras;
CREATE POLICY "Self management auth_im" ON public.inventario_muestras FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());