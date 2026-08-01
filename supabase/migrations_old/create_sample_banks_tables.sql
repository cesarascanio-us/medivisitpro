-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Create Sample Banks System (8 tables)
-- Date: 2025-12-22
-- Purpose: Complete sample inventory management system

-- 1. INVENTARIO MUESTRAS (Base stock)
CREATE TABLE IF NOT EXISTS inventario_muestras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    lote TEXT NOT NULL,
    fecha_fabricacion DATE,
    fecha_vencimiento DATE NOT NULL,
    cantidad_asignada INTEGER NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENTREGAS BANCO (Deliveries to health centers)
CREATE TABLE IF NOT EXISTS entregas_banco (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    health_center_id UUID REFERENCES health_centers(id) ON DELETE CASCADE,
    servicio TEXT,
    jefe_servicio TEXT,
    fecha_entrega DATE NOT NULL,
    entregado_por TEXT,
    foto_acta_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DETALLE ENTREGA BANCO (Delivery details)
CREATE TABLE IF NOT EXISTS detalle_entrega_banco (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entrega_banco_id UUID REFERENCES entregas_banco(id) ON DELETE CASCADE NOT NULL,
    stock_muestra_id UUID REFERENCES inventario_muestras(id) ON DELETE CASCADE NOT NULL,
    cantidad_inicial INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REPOSICIONES BANCO (Replenishments)
CREATE TABLE IF NOT EXISTS reposiciones_banco (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    detalle_entrega_id UUID REFERENCES detalle_entrega_banco(id) ON DELETE CASCADE NOT NULL,
    stock_muestra_id UUID REFERENCES inventario_muestras(id) ON DELETE CASCADE NOT NULL,
    cantidad_repuesta INTEGER NOT NULL,
    fecha_reposicion DATE NOT NULL,
    usuario_reposicion TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISPENSACION MUESTRAS (Dispensation from bank)
CREATE TABLE IF NOT EXISTS dispensacion_muestras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventario_banco_id UUID REFERENCES inventario_muestras(id) ON DELETE CASCADE NOT NULL,
    fecha_dispensacion DATE NOT NULL,
    cantidad_dispensada INTEGER NOT NULL,
    entregado_a TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DISPENSACION PACIENTES (Dispensation to patients)
CREATE TABLE IF NOT EXISTS dispensacion_pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    health_center_id UUID REFERENCES health_centers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    lote TEXT,
    fecha_vencimiento DATE,
    nombre_paciente TEXT NOT NULL,
    cedula TEXT,
    telefono TEXT,
    diagnostico TEXT,
    fecha_dispensacion DATE NOT NULL,
    cantidad_dispensada INTEGER NOT NULL,
    dispensado_por TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENTREGA MUESTRAS (Sample deliveries during visits)
CREATE TABLE IF NOT EXISTS entrega_muestras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    stock_muestra_id UUID REFERENCES inventario_muestras(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID, -- Reference to doctors if exists, or make it text
    cantidad_entregada INTEGER NOT NULL,
    fecha_entrega DATE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MATERIALES PROMOCIONALES (Promotional materials)
CREATE TABLE IF NOT EXISTS materiales_promocionales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    cantidad_disponible INTEGER NOT NULL DEFAULT 0,
    cantidad_inicial INTEGER NOT NULL,
    fecha_recepcion DATE,
    notas TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventario_muestras_product ON inventario_muestras(product_id);
CREATE INDEX IF NOT EXISTS idx_inventario_muestras_vencimiento ON inventario_muestras(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_inventario_muestras_user ON inventario_muestras(user_id);

CREATE INDEX IF NOT EXISTS idx_entregas_banco_health_center ON entregas_banco(health_center_id);
CREATE INDEX IF NOT EXISTS idx_entregas_banco_fecha ON entregas_banco(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_entregas_banco_user ON entregas_banco(user_id);

CREATE INDEX IF NOT EXISTS idx_detalle_entrega_banco_entrega ON detalle_entrega_banco(entrega_banco_id);
CREATE INDEX IF NOT EXISTS idx_detalle_entrega_banco_stock ON detalle_entrega_banco(stock_muestra_id);

CREATE INDEX IF NOT EXISTS idx_reposiciones_banco_detalle ON reposiciones_banco(detalle_entrega_id);
CREATE INDEX IF NOT EXISTS idx_reposiciones_banco_stock ON reposiciones_banco(stock_muestra_id);

CREATE INDEX IF NOT EXISTS idx_dispensacion_muestras_inventario ON dispensacion_muestras(inventario_banco_id);
CREATE INDEX IF NOT EXISTS idx_dispensacion_muestras_fecha ON dispensacion_muestras(fecha_dispensacion);

CREATE INDEX IF NOT EXISTS idx_dispensacion_pacientes_health_center ON dispensacion_pacientes(health_center_id);
CREATE INDEX IF NOT EXISTS idx_dispensacion_pacientes_product ON dispensacion_pacientes(product_id);
CREATE INDEX IF NOT EXISTS idx_dispensacion_pacientes_cedula ON dispensacion_pacientes(cedula);

CREATE INDEX IF NOT EXISTS idx_entrega_muestras_visit ON entrega_muestras(visit_id);
CREATE INDEX IF NOT EXISTS idx_entrega_muestras_stock ON entrega_muestras(stock_muestra_id);

CREATE INDEX IF NOT EXISTS idx_materiales_product ON materiales_promocionales(product_id);
CREATE INDEX IF NOT EXISTS idx_materiales_user ON materiales_promocionales(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_sample_banks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventario_muestras_updated_at
    BEFORE UPDATE ON inventario_muestras
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_entregas_banco_updated_at
    BEFORE UPDATE ON entregas_banco
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_detalle_entrega_banco_updated_at
    BEFORE UPDATE ON detalle_entrega_banco
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_reposiciones_banco_updated_at
    BEFORE UPDATE ON reposiciones_banco
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_dispensacion_muestras_updated_at
    BEFORE UPDATE ON dispensacion_muestras
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_dispensacion_pacientes_updated_at
    BEFORE UPDATE ON dispensacion_pacientes
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_entrega_muestras_updated_at
    BEFORE UPDATE ON entrega_muestras
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

CREATE TRIGGER trigger_materiales_updated_at
    BEFORE UPDATE ON materiales_promocionales
    FOR EACH ROW EXECUTE FUNCTION update_sample_banks_updated_at();

-- Enable RLS
ALTER TABLE inventario_muestras ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas_banco ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_entrega_banco ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposiciones_banco ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensacion_muestras ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensacion_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrega_muestras ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales_promocionales ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simple: users can view/edit their own records)
CREATE POLICY "Users can manage own inventario_muestras"
    ON inventario_muestras FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own entregas_banco"
    ON entregas_banco FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own detalle_entrega_banco"
    ON detalle_entrega_banco FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own reposiciones_banco"
    ON reposiciones_banco FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own dispensacion_muestras"
    ON dispensacion_muestras FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own dispensacion_pacientes"
    ON dispensacion_pacientes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own entrega_muestras"
    ON entrega_muestras FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own materiales_promocionales"
    ON materiales_promocionales FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
