-- =================================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Modificación: Permitir a los gerentes editar el umbral de facturación por Zona
-- Fecha: 2026-04-01
-- =================================================================================

-- 1. Agregar columna sales_threshold a la tabla zones
ALTER TABLE public.zones 
ADD COLUMN IF NOT EXISTS sales_threshold numeric DEFAULT 2000;

-- 2. Asegurarse de que los mánagers / supervisores tienen permisos de UPDATE en zones
-- (Dependiendo de tus RLS actuales, la política de edición de zonas debería permitir
-- a los mánagers editar 'sales_threshold').

-- 3. Documentación del Esquema Añadido
COMMENT ON COLUMN public.zones.sales_threshold IS 'Umbral mínimo de unidades/ventas requerido para activar comisiones en esta zona (Ej: 5000 para Caracas)';

-- Nota: Recordar que la aplicación web también requerirá el uso de esta columna 
-- desde Zones.tsx y desde los hooks de comisiones.
