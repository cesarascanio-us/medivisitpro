-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Add region column to pharmacies
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS region text;

-- Populate region based on state
UPDATE public.pharmacies
SET region = CASE
    WHEN state IN ('Distrito Capital', 'Miranda', 'La Guaira') THEN 'Capital'
    WHEN state IN ('Aragua', 'Carabobo', 'Cojedes', 'Guárico') THEN 'Central'
    WHEN state IN ('Zulia', 'Falcón', 'Lara', 'Yaracuy') THEN 'Occidente'
    WHEN state IN ('Mérida', 'Táchira', 'Trujillo') THEN 'Los Andes'
    WHEN state IN ('Anzoátegui', 'Monagas', 'Sucre', 'Nueva Esparta') THEN 'Oriente'
    WHEN state IN ('Bolívar', 'Amazonas', 'Delta Amacuro') THEN 'Guayana'
    WHEN state IN ('Barinas', 'Portuguesa', 'Apure') THEN 'Llanos'
    ELSE 'Sin Región'
END
WHERE region IS NULL OR region = '';

-- Notify schema reload
NOTIFY pgrst, 'reload config';
