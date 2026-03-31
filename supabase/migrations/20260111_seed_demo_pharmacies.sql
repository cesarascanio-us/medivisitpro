-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Seed Pharmacies for Demo User
DO $$
DECLARE v_user_id uuid := auth.uid();
v_pharmacy_id uuid;
BEGIN -- Only run if user exists (current user)
IF v_user_id IS NOT NULL THEN -- Check if user already has pharmacies
IF NOT EXISTS (
    SELECT 1
    FROM public.pharmacies
    WHERE user_id = v_user_id
) THEN -- 1. Farmacia Demo Central
INSERT INTO public.pharmacies (
        user_id,
        name,
        rif,
        address,
        city,
        state,
        phone,
        contact_name,
        status,
        potential,
        priority
    )
VALUES (
        v_user_id,
        'Farmacia Demo Central',
        'J-12345678-0',
        'Av. Principal, Centro Comercial Demo, Local 5',
        'Ciudad Demo',
        'Miranda',
        -- Assuming Miranda exists/is valid, or use text
        '0212-555-0001',
        'Lic. María Pérez',
        'Activo',
        'Alto',
        'high'
    )
RETURNING id INTO v_pharmacy_id;
-- 2. Farmacia Vida Salud
INSERT INTO public.pharmacies (
        user_id,
        name,
        rif,
        address,
        city,
        state,
        phone,
        contact_name,
        status,
        potential,
        priority
    )
VALUES (
        v_user_id,
        'Farmacia Vida Salud',
        'J-87654321-0',
        'Calle La Paz, Edificio Médico',
        'Ciudad Demo',
        'Miranda',
        '0212-555-0002',
        'Dr. Juan López',
        'Activo',
        'Medio',
        'medium'
    );
-- 3. Botica Nueva
INSERT INTO public.pharmacies (
        user_id,
        name,
        rif,
        address,
        city,
        state,
        phone,
        contact_name,
        status,
        potential,
        priority
    )
VALUES (
        v_user_id,
        'Botica Nueva',
        'J-11223344-0',
        'Av. Bolívar, Esquina 2',
        'Ciudad Demo',
        'Miranda',
        '0212-555-0003',
        'Lic. Ana Ruiz',
        'Activo',
        'Bajo',
        'low'
    );
END IF;
-- Ensure Drugstores exist for this user too
IF NOT EXISTS (
    SELECT 1
    FROM public.drugstores
    WHERE user_id = v_user_id
) THEN
INSERT INTO public.drugstores (
        user_id,
        name,
        code,
        contact_name,
        phone,
        email,
        is_active
    )
VALUES (
        v_user_id,
        'Droguería Nena',
        'DRG-001',
        'Carlos Distribuidor',
        '0414-000-0000',
        'pedidos@nena.com',
        true
    );
END IF;
END IF;
END $$;