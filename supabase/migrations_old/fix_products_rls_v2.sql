-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- FIX: Allow users to view products from their own ORGANIZATION, not just their own creation.
-- 1. Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own and global products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
-- 2. Create the new permissive policy (Organization-based)
CREATE POLICY "Users can view products from their organization" ON public.products FOR
SELECT USING (
        organization_id = (
            SELECT organization_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
        OR user_id = auth.uid() -- Keep owner access just in case
        OR organization_id IS NULL -- Global products
    );
-- 3. Ensure organization_id is indexed for performance
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON public.products(organization_id);