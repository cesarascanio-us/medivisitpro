-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Transfer Orders System
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Create drugstores table (Droguerías)
-- =====================================================
CREATE TABLE IF NOT EXISTS drugstores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT, -- Código asignado por la droguería
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE drugstores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own drugstores" ON drugstores;
DROP POLICY IF EXISTS "Users can manage own drugstores" ON drugstores;

CREATE POLICY "Users can view own drugstores"
    ON drugstores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own drugstores"
    ON drugstores FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- 2. Create transfer_orders table (Pedidos/Transferencias)
-- =====================================================
CREATE TABLE IF NOT EXISTS transfer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Pharmacy/Contact info
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    pharmacy_name TEXT NOT NULL,
    pharmacy_address TEXT,
    pharmacy_phone TEXT,
    
    -- Drugstore info
    drugstore_id UUID REFERENCES drugstores(id) ON DELETE SET NULL,
    drugstore_name TEXT NOT NULL,
    drugstore_code TEXT, -- Código asignado por la droguería a la farmacia
    
    -- Order details
    order_number TEXT, -- Auto-generated or manual
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    
    -- Products (stored as JSON array)
    products JSONB NOT NULL DEFAULT '[]',
    -- Example: [{"product_id": "uuid", "name": "Producto X", "quantity": 10, "unit_price": 15.50}]
    
    -- Totals
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, sent, confirmed, delivered, cancelled
    
    -- Notes
    notes TEXT,
    internal_notes TEXT, -- Notes for internal use
    
    -- Document tracking
    document_generated BOOLEAN DEFAULT false,
    document_url TEXT,
    sent_to_email TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transfer_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own transfer orders" ON transfer_orders;
DROP POLICY IF EXISTS "Users can manage own transfer orders" ON transfer_orders;

CREATE POLICY "Users can view own transfer orders"
    ON transfer_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transfer orders"
    ON transfer_orders FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. Create transfer_order_history table (Historial)
-- =====================================================
CREATE TABLE IF NOT EXISTS transfer_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_order_id UUID REFERENCES transfer_orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL, -- created, updated, status_changed, cancelled, deleted
    previous_data JSONB, -- Snapshot of previous state
    new_data JSONB, -- Snapshot of new state
    changes_description TEXT, -- Human readable description
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transfer_order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own transfer history" ON transfer_order_history;
DROP POLICY IF EXISTS "Users can create transfer history" ON transfer_order_history;

CREATE POLICY "Users can view own transfer history"
    ON transfer_order_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create transfer history"
    ON transfer_order_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transfer_orders_user_id ON transfer_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_status ON transfer_orders(status);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_order_date ON transfer_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_contact_id ON transfer_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_drugstore_id ON transfer_orders(drugstore_id);
CREATE INDEX IF NOT EXISTS idx_drugstores_user_id ON drugstores(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_order_history_order_id ON transfer_order_history(transfer_order_id);

-- =====================================================
-- 5. Function to auto-generate order number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'TRF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_order_number ON transfer_orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON transfer_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- Done!
-- =====================================================
-- Tables created:
-- - drugstores (Droguerías con nombre y código)
-- - transfer_orders (Pedidos/Transferencias)
-- - transfer_order_history (Historial de cambios)
