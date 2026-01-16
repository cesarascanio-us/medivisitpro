-- =====================================================
-- TABLA DOCTORS - Módulo de Médicos Expandido
-- =====================================================

-- Crear tabla doctors
CREATE TABLE IF NOT EXISTS doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    representative_id UUID REFERENCES profiles(id),
    
    -- Información personal
    name TEXT NOT NULL,
    birth_date DATE,
    phone TEXT,
    mobile TEXT,
    email TEXT,
    
    -- Información profesional
    specialty TEXT,
    msds TEXT,
    cm TEXT,
    
    -- Ubicación
    address TEXT,
    location TEXT,
    city TEXT,
    state TEXT,
    health_center TEXT,
    
    -- Horario de atención
    days TEXT,
    start_time TIME,
    end_time TIME,
    
    -- Clasificación
    potential TEXT CHECK (potential IN ('Alto', 'Medio', 'Bajo')),
    
    -- Seguimiento
    observations TEXT,
    last_visit DATE,
    status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo')),
    
    -- Redes sociales
    instagram TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_doctors_user ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_representative ON doctors(representative_id);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_potential ON doctors(potential);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver sus propios médicos
CREATE POLICY "Users can view their own doctors"
    ON doctors FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden insertar sus propios médicos
CREATE POLICY "Users can insert their own doctors"
    ON doctors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar sus propios médicos
CREATE POLICY "Users can update their own doctors"
    ON doctors FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus propios médicos
CREATE POLICY "Users can delete their own doctors"
    ON doctors FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA UPDATED_AT
-- =====================================================
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRACIÓN DE DATOS (OPCIONAL)
-- Si tienes médicos existentes en contacts, ejecuta esto:
-- =====================================================

-- Descomentar si necesitas migrar datos existentes:
/*
INSERT INTO doctors (
    id, user_id, name, phone, email, address, city, 
    specialty, observations, created_at
)
SELECT 
    id, user_id, name, phone, email, address, city,
    specialty, notes as observations, created_at
FROM contacts
WHERE contact_type = 'doctor';
*/

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE doctors IS 'Tabla de médicos con información completa profesional y de contacto';
COMMENT ON COLUMN doctors.birth_date IS 'Fecha de nacimiento del médico';
COMMENT ON COLUMN doctors.specialty IS 'Especialidad médica';
COMMENT ON COLUMN doctors.msds IS 'Indicador MSDS';
COMMENT ON COLUMN doctors.cm IS 'Indicador CM';
COMMENT ON COLUMN doctors.health_center IS 'Centro de salud donde atiende';
COMMENT ON COLUMN doctors.days IS 'Días de atención';
COMMENT ON COLUMN doctors.start_time IS 'Hora de inicio de atención';
COMMENT ON COLUMN doctors.end_time IS 'Hora de fin de atención';
COMMENT ON COLUMN doctors.potential IS 'Potencial del médico: Alto, Medio, Bajo';
