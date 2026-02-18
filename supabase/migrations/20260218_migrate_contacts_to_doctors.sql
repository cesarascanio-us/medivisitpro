-- =====================================================
-- MIGRACIÓN DE DATOS: REPARACIÓN DE FICHERO MÉDICO
-- Fecha: 2026-02-18
-- Propósito: Mover doctores desde la tabla genérica 'contacts' a su tabla correcta 'doctors'
--            para solucionar módulos vacíos y discrepancias en el Dashboard.
-- =====================================================
DO $$
DECLARE migrated_count INT := 0;
BEGIN RAISE NOTICE 'Iniciando diagnóstico y reparación de datos...';
-- 1. INSERTAR DOCTORES EN LA TABLA CORRECTA
-- Seleccionamos de 'contacts' donde el tipo es 'doctor' y los insertamos en 'doctors'
-- Mapeamos columnas legacy (priority -> potential) y aseguramos integridad referencial
INSERT INTO public.doctors (
        id,
        user_id,
        organization_id,
        representative_id,
        name,
        phone,
        email,
        address,
        city,
        state,
        specialty,
        potential,
        observations,
        status,
        created_at,
        updated_at
    )
SELECT c.id,
    c.user_id,
    -- Si por error no tenía organización, asignamos a la Demo Org
    COALESCE(
        c.organization_id,
        'd3300000-0000-0000-0000-000000000001'::uuid
    ),
    c.user_id,
    -- El creador se asigna como representante
    c.name,
    c.phone,
    c.email,
    c.address,
    c.city,
    c.state,
    c.specialty,
    -- Mapeo de prioridad legacy a potencial nuevo
    CASE
        c.priority
        WHEN 'high' THEN 'Alto'
        WHEN 'medium' THEN 'Medio'
        WHEN 'low' THEN 'Bajo'
        ELSE 'Medio'
    END,
    c.notes,
    -- Notas pasan a observaciones
    'Activo',
    c.created_at,
    NOW()
FROM public.contacts c
WHERE c.contact_type = 'doctor' -- Evitamos duplicados si ya existen por ID
    ON CONFLICT (id) DO NOTHING;
GET DIAGNOSTICS migrated_count = ROW_COUNT;
RAISE NOTICE '✅ Se han migrado exitosamente % doctores a la tabla doctors.',
migrated_count;
-- 2. LIMPIEZA DB (Opcional pero recomendado para evitar duplicados en el Directorio)
-- Ahora que están seguros en 'doctors', los quitamos de 'contacts'
-- El Dashboard lee ambas tablas y las une, así que borrarlos de aquí evita que salgan dobles
IF migrated_count > 0 THEN
DELETE FROM public.contacts
WHERE contact_type = 'doctor';
RAISE NOTICE '🧹 Se han eliminado los registros duplicados de la tabla contacts.';
ELSE RAISE NOTICE '⚠️ No se encontraron doctores nuevos para migrar en contacts.';
END IF;
RAISE NOTICE 'Diagnóstico finalizado. Por favor recarga el módulo Fichero Médico.';
END $$;