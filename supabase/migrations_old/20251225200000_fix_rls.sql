-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Fix RLS Policies to allow Master/Admin to create Banks and Health Centers

-- 1. Policies for sample_banks
-- Allow users to insert if they assign it to themselves (Master flow)
DROP POLICY IF EXISTS "Users can insert own banks" ON public.sample_banks;
CREATE POLICY "Users can insert own banks"
ON public.sample_banks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = responsible_user_id);

-- 2. Policies for health_centers
-- Allow insert for the Dummy Hospital creation
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.health_centers;
CREATE POLICY "Enable insert for authenticated users"
ON public.health_centers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure select is open (if not already)
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.health_centers;
CREATE POLICY "Enable select for authenticated users"
ON public.health_centers
FOR SELECT
TO authenticated
USING (true);
