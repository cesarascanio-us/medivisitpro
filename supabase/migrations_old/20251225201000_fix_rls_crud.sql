-- Enable UPDATE and DELETE for sample_banks
-- Allow responsible users to Rename or Delete their banks

-- 1. UPDATE Policy
DROP POLICY IF EXISTS "Users can update own banks" ON public.sample_banks;
CREATE POLICY "Users can update own banks"
ON public.sample_banks
FOR UPDATE
TO authenticated
USING (auth.uid() = responsible_user_id)
WITH CHECK (auth.uid() = responsible_user_id);

-- 2. DELETE Policy
DROP POLICY IF EXISTS "Users can delete own banks" ON public.sample_banks;
CREATE POLICY "Users can delete own banks"
ON public.sample_banks
FOR DELETE
TO authenticated
USING (auth.uid() = responsible_user_id);
