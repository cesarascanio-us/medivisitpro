-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migración 005: Sistema de Triangulación Comercial
-- Objetivo: Reflejar que la empresa es intermediaria entre farmacia y droguería

-- ============================================================================
-- PASO 1: Agregar nuevas columnas a transfer_orders
-- ============================================================================

-- Droguería que finalmente procesa el pedido (puede diferir de la sugerida)
ALTER TABLE transfer_orders 
ADD COLUMN IF NOT EXISTS drogueria_final_id UUID REFERENCES drugstores(id);

-- Código de pedido generado por la droguería externa
ALTER TABLE transfer_orders 
ADD COLUMN IF NOT EXISTS codigo_pedido_externo TEXT;

-- Notas de seguimiento de Telemarketing
ALTER TABLE transfer_orders 
ADD COLUMN IF NOT EXISTS notas_telemarketing TEXT;

-- Timestamp de confirmación con droguería
ALTER TABLE transfer_orders 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- ============================================================================
-- PASO 2: Actualizar enum de estados
-- ============================================================================

-- Convertir columna status a TEXT temporalmente
ALTER TABLE transfer_orders 
ALTER COLUMN status TYPE TEXT;

-- Eliminar tipo enum anterior si existe
DROP TYPE IF EXISTS transfer_status CASCADE;

-- Crear nuevo tipo enum con estados de triangulación
CREATE TYPE transfer_status AS ENUM (
    'pending',                      -- Solicitado por Rep (inicial)
    'processing',                   -- Telemarketing gestionando con droguería
    'confirmed_by_distributor',     -- Droguería aceptó y confirmó pedido
    'rejected_by_distributor',      -- Droguería rechazó (no stock/crédito)
    'delivered',                    -- Entregado a farmacia (seguimiento)
    'cancelled'                     -- Cancelado por cualquier motivo
);

-- Aplicar tipo enum a columna status
ALTER TABLE transfer_orders 
ALTER COLUMN status TYPE transfer_status 
USING status::transfer_status;

-- Establecer valor por defecto
ALTER TABLE transfer_orders 
ALTER COLUMN status SET DEFAULT 'pending'::transfer_status;

-- ============================================================================
-- PASO 3: Migración de datos existentes
-- ============================================================================

-- Actualizar estados antiguos a nuevos (si existen registros)
-- 'approved' -> 'confirmed_by_distributor'
-- 'rejected' -> 'rejected_by_distributor'
-- Otros estados se mantienen como 'pending'

-- Comentar si no hay datos previos
-- UPDATE transfer_orders SET status = 'confirmed_by_distributor'::transfer_status WHERE status::text = 'approved';
-- UPDATE transfer_orders SET status = 'rejected_by_distributor'::transfer_status WHERE status::text = 'rejected';

-- ============================================================================
-- PASO 4: Crear índices para performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transfer_orders_drogueria_final 
ON transfer_orders(drogueria_final_id);

CREATE INDEX IF NOT EXISTS idx_transfer_orders_status 
ON transfer_orders(status);

CREATE INDEX IF NOT EXISTS idx_transfer_orders_codigo_externo 
ON transfer_orders(codigo_pedido_externo);

-- ============================================================================
-- PASO 5: Comentarios en columnas (documentación)
-- ============================================================================

COMMENT ON COLUMN transfer_orders.drogueria_final_id IS 
'Droguería que finalmente procesó el pedido. Puede diferir de la sugerida por el representante si esta no tiene stock.';

COMMENT ON COLUMN transfer_orders.codigo_pedido_externo IS 
'Código de pedido generado por la droguería externa (ej: Nena-8842, Quimfa-5521).';

COMMENT ON COLUMN transfer_orders.notas_telemarketing IS 
'Notas de seguimiento del equipo de Telemarketing durante la gestión con la droguería.';

COMMENT ON COLUMN transfer_orders.confirmed_at IS 
'Timestamp de cuando la droguería confirmó el pedido.';

-- ============================================================================
-- PASO 6: (Opcional) Trigger para inventario de droguerías
-- ============================================================================

-- Solo ejecutar si existe tabla inventario_droguerias
-- Descomentar si se usa módulo de inventario de droguerías:

/*
CREATE OR REPLACE FUNCTION update_drogueria_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo descontar si el pedido fue confirmado por droguería
    IF NEW.status = 'confirmed_by_distributor' 
       AND NEW.drogueria_final_id IS NOT NULL 
       AND OLD.status != 'confirmed_by_distributor' 
    THEN
        UPDATE inventario_droguerias
        SET stock_estimado = stock_estimado - NEW.quantity
        WHERE drogueria_id = NEW.drogueria_final_id
          AND product_id = NEW.product_id
          AND stock_estimado >= NEW.quantity;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_drogueria_inventory
AFTER UPDATE ON transfer_orders
FOR EACH ROW
WHEN (NEW.status = 'confirmed_by_distributor')
EXECUTE FUNCTION update_drogueria_inventory();
*/

-- ============================================================================
-- PASO 7: Políticas RLS (si aplican)
-- ============================================================================

-- Asegurar que RLS siga funcionando con nuevas columnas
-- Las políticas existentes deberían seguir funcionando sin cambios

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transfer_orders'
  AND column_name IN ('drogueria_final_id', 'codigo_pedido_externo', 'notas_telemarketing', 'confirmed_at');

-- Verificar el nuevo enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'transfer_status'::regtype
ORDER BY enumsortorder;

-- Verificar índices creados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'transfer_orders'
  AND indexname LIKE 'idx_transfer_orders_%';
