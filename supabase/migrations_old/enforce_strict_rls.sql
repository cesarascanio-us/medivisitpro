-- ENFORCE STRICT RLS: Representatives only see their OWN data (user_id = auth.uid())
-- Applies to: contacts, doctors
-- 1. Contacts
DROP POLICY IF EXISTS "RBAC Contact Select" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Insert" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Update" ON public.contacts;
DROP POLICY IF EXISTS "RBAC Contact Delete" ON public.contacts;
CREATE POLICY "Representatives see own contacts" ON public.contacts FOR ALL USING (
    (auth.uid() = user_id) -- Strict ownership
    OR (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role IN ('admin', 'manager', 'master')
        )
    ) -- Admins see all (likely via another policy or Organization check, but let's keep it simple for now or rely on Organization policy if it exists)
);
-- Note: If we want to allow Admins/Managers to see ALL organization contacts, we need a separate condition:
-- OR (organization_id = ... AND role IN ('admin', 'manager'))
-- Let's try a hybrid approach that is commonly used:
CREATE POLICY "Users view own or organization data based on role" ON public.contacts FOR
SELECT USING (
        auth.uid() = user_id -- Always see your own
        OR (
            organization_id = (
                SELECT organization_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
            AND (
                SELECT role
                FROM public.user_roles
                WHERE user_id = auth.uid()
            ) IN ('admin', 'manager', 'coordinator', 'supervisor')
        )
    );
-- For INSERT/UPDATE/DELETE, usually strictly own data for Reps
CREATE POLICY "Users manage own contacts" ON public.contacts FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contacts" ON public.contacts FOR
UPDATE USING (auth.uid() = user_id);
-- 2. Doctors (Fichero Médico)
DROP POLICY IF EXISTS "Users can view own doctors" ON public.doctors;
-- ... (Similar logic for doctors)
CREATE POLICY "Users view own or organization doctors based on role" ON public.doctors FOR
SELECT USING (
        auth.uid() = user_id
        OR (
            organization_id = (
                SELECT organization_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
            AND (
                SELECT role
                FROM public.user_roles
                WHERE user_id = auth.uid()
            ) IN ('admin', 'manager', 'coordinator', 'supervisor')
        )
    );
CREATE POLICY "Users manage own doctors" ON public.doctors FOR ALL USING (auth.uid() = user_id);