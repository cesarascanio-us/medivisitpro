/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

-- 1. Agregar columna de relación en doctors (contacts)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL;

-- 2. Indexar para rendimiento
CREATE INDEX IF NOT EXISTS idx_doctors_health_center_id ON doctors(health_center_id);

-- 3. Migración de datos legados (String -> ID)
UPDATE doctors d
SET health_center_id = hc.id
FROM health_centers hc
WHERE hc.name = d.health_center
AND d.health_center_id IS NULL
AND hc.organization_id = (SELECT organization_id FROM users u WHERE u.id = d.user_id LIMIT 1);

-- 4. Asegurar que health_centers tenga organization_id (ya existe según types.ts pero reforzamos RLS)
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;

-- 5. Actualizar políticas RLS para health_centers
DROP POLICY IF EXISTS "Users can see centers of their organization" ON health_centers;
CREATE POLICY "Users can see centers of their organization"
ON health_centers FOR SELECT
USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage centers of their organization" ON health_centers;
CREATE POLICY "Users can manage centers of their organization"
ON health_centers FOR ALL
USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

COMMENT ON COLUMN doctors.health_center IS 'Nombre del centro (Legacy String Field)';
COMMENT ON COLUMN doctors.health_center_id IS 'Relación Maestra con la tabla health_centers';
