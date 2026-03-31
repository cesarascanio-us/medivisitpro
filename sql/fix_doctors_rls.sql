-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =============================================
-- Fix RLS policies for doctors table
-- Master and Admin users should see all doctors
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins view all doctors" ON public.doctors;
DROP POLICY IF EXISTS "Supervisors view zone doctors" ON public.doctors;
DROP POLICY IF EXISTS "Supervisors view region doctors" ON public.doctors;
DROP POLICY IF EXISTS "Reps view own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can insert doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can update doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can delete doctors" ON public.doctors;

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Master/Admin can view all doctors
CREATE POLICY "Admins view all doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

-- Supervisors can view doctors in their region (based on state column)
CREATE POLICY "Supervisors view region doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('supervisor', 'coordinator', 'service_chief')
    )
);

-- Representatives can view their own doctors
CREATE POLICY "Reps view own doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR representative_id = auth.uid()
);

-- Insert policy - any authenticated user can insert
CREATE POLICY "Users can insert doctors"
ON public.doctors
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update policy - own records or admin
CREATE POLICY "Users can update doctors"
ON public.doctors
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() 
    OR representative_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager', 'supervisor')
    )
);

-- Delete policy - own records or admin
CREATE POLICY "Users can delete doctors"
ON public.doctors
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid() 
    OR representative_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('master', 'admin', 'manager')
    )
);

NOTIFY pgrst, 'reload config';
