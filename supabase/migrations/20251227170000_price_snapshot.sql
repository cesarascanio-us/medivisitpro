-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Price Snapshot for Historical Order Integrity
-- Date: 2025-12-27
-- Purpose: Protect historical order prices from catalog changes

-- =====================================================
-- 1. Add items_snapshot column to transfer_orders
-- =====================================================
-- This JSONB column stores a frozen copy of the order items
-- with their prices at the time of order creation.

ALTER TABLE public.transfer_orders 
ADD COLUMN IF NOT EXISTS items_snapshot JSONB;

-- =====================================================
-- 2. Documentation of the snapshot structure
-- =====================================================
COMMENT ON COLUMN public.transfer_orders.items_snapshot IS 
'Snapshot of order items with frozen prices at order creation time.
Structure: [
  {
    "product_id": "uuid",
    "product_name": "string",
    "quantity": number,
    "unit_price": number (price at order time),
    "subtotal": number
  }
]
Use this column for historical reporting to avoid price corruption.';

-- =====================================================
-- 3. Backfill existing orders (copy products to items_snapshot)
-- =====================================================
-- For existing orders, copy the products JSONB to items_snapshot
-- This ensures backward compatibility.

UPDATE public.transfer_orders
SET items_snapshot = products
WHERE items_snapshot IS NULL 
  AND products IS NOT NULL;

-- =====================================================
-- 4. Create index for performance on JSONB queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transfer_orders_items_snapshot 
ON public.transfer_orders USING gin (items_snapshot);
