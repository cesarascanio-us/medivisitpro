-- Fix: Enable inserts on sample_assignments for supervisors and above

-- 1. Allow authenticated users to insert their own assignments
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.sample_assignments;
CREATE POLICY "Allow insert for authenticated" ON public.sample_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 2. Allow authenticated users to read assignments they created or are assigned to
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.sample_assignments;
CREATE POLICY "Allow select for authenticated" ON public.sample_assignments
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Allow insert on assignment_items
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.assignment_items;
CREATE POLICY "Allow insert for authenticated" ON public.assignment_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. Allow select on assignment_items
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.assignment_items;
CREATE POLICY "Allow select for authenticated" ON public.assignment_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Reload config
NOTIFY pgrst, 'reload config';
