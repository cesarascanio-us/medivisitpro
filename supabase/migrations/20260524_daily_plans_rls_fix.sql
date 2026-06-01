-- Enable RLS for daily_plans if not already enabled
ALTER TABLE IF EXISTS public.daily_plans ENABLE ROW LEVEL SECURITY;

-- Allow representatives to insert their own plans
CREATE POLICY "Permitir a representantes crear planes diarios"
ON public.daily_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow representatives to update their own plans
CREATE POLICY "Permitir a representantes actualizar sus propios planes diarios"
ON public.daily_plans
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow representatives to read their own plans (if not already existing)
CREATE POLICY "Permitir a representantes ver sus propios planes diarios"
ON public.daily_plans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
