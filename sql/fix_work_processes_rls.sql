-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Fix RLS for Work Processes to allow Company-Wide Access
-- Currently, policies might restrict access to only the creator (user_id = auth.uid())

-- 1. Drop strict policies if they exist
DROP POLICY IF EXISTS "Users can manage own work processes" ON public.work_processes;

-- 2. Create READ policy (Global within authenticated users)
-- All employees should be able to read SOPs and Processes
CREATE POLICY "Enable read access for all users" ON public.work_processes
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 3. Create WRITE policy (Creator or Admin/Master)
-- Only the creator or an Admin/Master can update/delete
CREATE POLICY "Enable write access for owners and admins" ON public.work_processes
    FOR ALL
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('master', 'admin')
        )
    );

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload config';
