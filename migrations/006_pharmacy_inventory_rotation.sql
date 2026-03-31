-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================


-- Migration 006: Pharmacy Inventory and Rotation Tracking
-- Purpose: Add quantitative tracking fields to pharmacy audits

-- Step 1: Add quantitative fields to registro_pvp_farmacia
ALTER TABLE registro_pvp_farmacia 
ADD COLUMN IF NOT EXISTS cantidad_actual INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cantidad_anterior INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ventas_estimadas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pharmacy_id UUID REFERENCES contacts(id);

-- Step 2: Comment for documentation
COMMENT ON COLUMN registro_pvp_farmacia.cantidad_actual IS 'Cantidad física encontrada en anaquel durante la visita';
COMMENT ON COLUMN registro_pvp_farmacia.cantidad_anterior IS 'Cantidad física registrada en la visita anterior';
COMMENT ON COLUMN registro_pvp_farmacia.ventas_estimadas IS 'Rotación calculada: (Anterior + Pedidos) - Actual';
COMMENT ON COLUMN registro_pvp_farmacia.pharmacy_id IS 'Referencia directa a la farmacia (para ingresos manuales)';

-- Step 3: Ensure RLS is enabled if not already (standard practice)
-- ALTER TABLE registro_pvp_farmacia ENABLE ROW LEVEL SECURITY;
