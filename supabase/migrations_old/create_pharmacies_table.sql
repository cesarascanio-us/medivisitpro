-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- TABLA PHARMACIES - Módulo de Farmacias Expandido
-- =====================================================

-- Crear tabla pharmacies
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id),
    representative_id UUID REFERENCES profiles(id),
    
    -- Información básica
    name TEXT NOT NULL,
    rif TEXT,
    address TEXT,
    city TEXT,
    sector TEXT,
    state TEXT,
    
    -- Contacto
    phone TEXT,
    contact_phone TEXT,
    contact_name TEXT,
    email TEXT,
    main_contact TEXT,
    contact_position TEXT,
    
    -- Horarios
    schedule TEXT,
    business_hours TEXT,
    
    -- Productos y clasificación
    promoted_products TEXT[],
    product_interest TEXT,
    segmentation TEXT,
    potential TEXT CHECK (potential IN ('Alto', 'Medio', 'Bajo')),
    
    -- Seguimiento
    follow_up_action TEXT,
    last_visit DATE,
    status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo')),
    
    -- Redes sociales
    instagram TEXT,
    
    -- Campos adicionales
    notes TEXT,
    priority TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pharmacies_user ON pharmacies(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_zone ON pharmacies(zone_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON pharmacies(city);
CREATE INDEX IF NOT EXISTS idx_pharmacies_status ON pharmacies(status);
CREATE INDEX IF NOT EXISTS idx_pharmacies_potential ON pharmacies(potential);
CREATE INDEX IF NOT EXISTS idx_pharmacies_segmentation ON pharmacies(segmentation);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver sus propias farmacias
CREATE POLICY "Users can view their own pharmacies"
    ON pharmacies FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden insertar sus propias farmacias
CREATE POLICY "Users can insert their own pharmacies"
    ON pharmacies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar sus propias farmacias
CREATE POLICY "Users can update their own pharmacies"
    ON pharmacies FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus propias farmacias
CREATE POLICY "Users can delete their own pharmacies"
    ON pharmacies FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_pharmacies_updated_at
    BEFORE UPDATE ON pharmacies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRACIÓN DE DATOS (OPCIONAL)
-- Si tienes farmacias existentes en contacts, ejecuta esto:
-- =====================================================

-- Descomentar si necesitas migrar datos existentes:
/*
INSERT INTO pharmacies (
    id, user_id, name, address, city, phone, email, notes, priority, created_at
)
SELECT 
    id, user_id, name, address, city, phone, email, notes, priority, created_at
FROM contacts
WHERE contact_type = 'pharmacy';
*/

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE pharmacies IS 'Tabla de farmacias con campos específicos del negocio';
COMMENT ON COLUMN pharmacies.rif IS 'Registro de Información Fiscal';
COMMENT ON COLUMN pharmacies.potential IS 'Potencial de la farmacia: Alto, Medio, Bajo';
COMMENT ON COLUMN pharmacies.segmentation IS 'Categoría o segmento de la farmacia';
COMMENT ON COLUMN pharmacies.promoted_products IS 'Array de productos promocionados';
