-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Allow Master and Admin to update any profile
CREATE POLICY "Permitir editar profiles a Master y Admin" ON public.profiles FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
                AND ur.role IN ('master', 'admin')
        )
    );
-- Ensure we don't have conflicting policies (optional, but good practice to check)
-- The existing policy only allows (uid() = user_id), so adding this new one 
-- extends permissions (OR logic applies between policies).