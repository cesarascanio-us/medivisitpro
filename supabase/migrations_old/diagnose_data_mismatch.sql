-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- DIAGNOSTIC: Check for Organization Mismatch
-- Run this to see who belongs to which org, and who owns which products.
SELECT p.email,
    ur.role,
    p.organization_id,
    o.name as organization_name
FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    LEFT JOIN public.organizations o ON p.organization_id = o.id;
SELECT count(*) as product_count,
    organization_id
FROM public.products
GROUP BY organization_id;
-- Check if any products have NULL organization_id
SELECT count(*) as global_products
FROM public.products
WHERE organization_id IS NULL;