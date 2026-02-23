-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- SCRIPT CONSOLIDADO PARA ENTORNO DEMO
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Fecha: 2026-01-11
-- =====================================================
-- 1. ARREGLAR POLÍTICAS RLS PARA DOCTORS
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can insert own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can update own doctors" ON public.doctors;
DROP POLICY IF EXISTS "Users can delete own doctors" ON public.doctors;
CREATE POLICY "Users can view own doctors" ON public.doctors FOR
SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own doctors" ON public.doctors FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own doctors" ON public.doctors FOR
UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own doctors" ON public.doctors FOR DELETE TO authenticated USING (user_id = auth.uid());
-- 2. ARREGLAR POLÍTICAS RLS PARA DRUGSTORES
-- ------------------------------------------
DROP POLICY IF EXISTS "Users can view own drugstores" ON public.drugstores;
DROP POLICY IF EXISTS "Users can insert own drugstores" ON public.drugstores;
DROP POLICY IF EXISTS "Users can update own drugstores" ON public.drugstores;
DROP POLICY IF EXISTS "Users can delete own drugstores" ON public.drugstores;
CREATE POLICY "Users can view own drugstores" ON public.drugstores FOR
SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own drugstores" ON public.drugstores FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own drugstores" ON public.drugstores FOR
UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own drugstores" ON public.drugstores FOR DELETE TO authenticated USING (user_id = auth.uid());
-- 3. FUNCIÓN DE SEEDING CON SECURITY DEFINER
-- -------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_demo_data(p_user_id UUID) RETURNS TEXT AS $$
DECLARE result TEXT := '';
BEGIN -- Farmacias
IF NOT EXISTS (
    SELECT 1
    FROM pharmacies
    WHERE user_id = p_user_id
) THEN
INSERT INTO pharmacies (
        user_id,
        name,
        address,
        city,
        state,
        phone,
        contact_name,
        status,
        potential
    )
VALUES (
        p_user_id,
        'Farmacia Demo Central',
        'Av. Principal #123',
        'Caracas',
        'Distrito Capital',
        '0212-555-0001',
        'Lic. María Pérez',
        'Activo',
        'Alto'
    ),
    (
        p_user_id,
        'Farmacia Vida Salud',
        'Calle La Paz #45',
        'Valencia',
        'Carabobo',
        '0241-555-0002',
        'Lic. Juan López',
        'Activo',
        'Medio'
    ),
    (
        p_user_id,
        'Botica Nueva',
        'Av. Bolívar #78',
        'Maracaibo',
        'Zulia',
        '0261-555-0003',
        'Lic. Ana Ruiz',
        'Activo',
        'Bajo'
    );
result := result || '3 farmacias creadas. ';
END IF;
-- Médicos
IF NOT EXISTS (
    SELECT 1
    FROM doctors
    WHERE user_id = p_user_id
) THEN
INSERT INTO doctors (
        user_id,
        name,
        specialty,
        city,
        state,
        phone,
        status
    )
VALUES (
        p_user_id,
        'Dr. Carlos Méndez',
        'Cardiología',
        'Caracas',
        'Distrito Capital',
        '0412-111-1111',
        'Activo'
    ),
    (
        p_user_id,
        'Dra. Laura Gómez',
        'Medicina Interna',
        'Valencia',
        'Carabobo',
        '0414-222-2222',
        'Activo'
    ),
    (
        p_user_id,
        'Dr. Roberto Fernández',
        'Pediatría',
        'Maracaibo',
        'Zulia',
        '0416-333-3333',
        'Activo'
    ),
    (
        p_user_id,
        'Dra. Patricia Sánchez',
        'Dermatología',
        'Barquisimeto',
        'Lara',
        '0424-444-4444',
        'Activo'
    ),
    (
        p_user_id,
        'Dr. Miguel Torres',
        'Ginecología',
        'Mérida',
        'Mérida',
        '0426-555-5555',
        'Activo'
    );
result := result || '5 médicos creados. ';
END IF;
-- Contactos (usando ENUMs correctos: hospital, clinic, doctor, pharmacy)
IF NOT EXISTS (
    SELECT 1
    FROM contacts
    WHERE user_id = p_user_id
) THEN
INSERT INTO contacts (
        user_id,
        name,
        contact_type,
        phone,
        city,
        address
    )
VALUES (
        p_user_id,
        'Hospital Central Demo',
        'hospital',
        '0212-666-6666',
        'Caracas',
        'Av. Libertador'
    ),
    (
        p_user_id,
        'Clínica Modelo',
        'clinic',
        '0212-777-7777',
        'Valencia',
        'Urb. El Bosque'
    );
result := result || '2 contactos creados. ';
END IF;
-- Droguerías
IF NOT EXISTS (
    SELECT 1
    FROM drugstores
    WHERE user_id = p_user_id
) THEN
INSERT INTO drugstores (
        user_id,
        name,
        code,
        contact_name,
        phone,
        is_active
    )
VALUES (
        p_user_id,
        'Droguería Nena',
        'DRG-001',
        'Carlos Distribuidor',
        '0414-000-0000',
        true
    ),
    (
        p_user_id,
        'Droguería Central',
        'DRG-002',
        'María Distribuidora',
        '0412-111-1111',
        true
    );
result := result || '2 droguerías creadas. ';
END IF;
IF result = '' THEN result := 'Datos demo ya existen para este usuario.';
END IF;
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 4. GRANT PARA LLAMAR LA FUNCIÓN
-- --------------------------------
GRANT EXECUTE ON FUNCTION public.seed_demo_data(UUID) TO authenticated;
-- 5. MENSAJE DE CONFIRMACIÓN
-- ---------------------------
SELECT 'Script ejecutado correctamente. Ahora cierra sesión y vuelve a entrar con el usuario demo.' as mensaje;