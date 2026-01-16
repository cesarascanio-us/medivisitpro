-- Fix RLS for doctors table - allow authenticated users to manage their own records
DROP POLICY IF EXISTS "Users can view own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can insert own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can update own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can delete own doctors" ON public.doctors;
CREATE POLICY "Users can view own doctors" ON public.doctors FOR
SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own doctors" ON public.doctors FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own doctors" ON public.doctors FOR
UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own doctors" ON public.doctors FOR DELETE TO authenticated USING (user_id = auth.uid());
-- Fix RLS for drugstores table
DROP POLICY IF EXISTS "Users can view own drugstores" ON public.drugstores;
DROP POLICY IF EXISTS "Users can insert own drugstores" ON public.drugstores;
DROP POLICY IF EXISTS "Users can update own drugstores" ON public.drugstores;
DROP POLICY IF EXISTS "Users can delete own drugstores" ON public.drugstores;
CREATE POLICY "Users can view own drugstores" ON public.drugstores FOR
SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own drugstores" ON public.drugstores FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own drugstores" ON public.drugstores FOR
UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own drugstores" ON public.drugstores FOR DELETE TO authenticated USING (user_id = auth.uid());