-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- ===============================================================
-- DEMO USER DATA POPULATION - Triggered after first login
-- Date: 2026-01-11
-- Purpose: Create visits, inventory, assignments, and objectives
-- This should be called AFTER the demo user exists in the system
-- ===============================================================
-- This function will be called when the demo user logs in for the first time
CREATE OR REPLACE FUNCTION populate_demo_user_data() RETURNS TRIGGER AS $$
DECLARE demo_org_id UUID := 'd3300000-0000-0000-0000-000000000001';
demo_email TEXT := 'demo.medivisitpro@gmail.com';
is_demo_user BOOLEAN;
user_already_populated BOOLEAN;
-- Product IDs (we'll fetch these)
product_ids UUID [];
-- Doctor IDs (we'll fetch these)
doctor_ids UUID [];
-- Counter
i INT;
visit_id UUID;
BEGIN -- Check if this is the demo user
SELECT email INTO demo_email
FROM auth.users
WHERE id = NEW.user_id;
is_demo_user := (demo_email = 'demo.medivisitpro@gmail.com');
IF NOT is_demo_user THEN RETURN NEW;
END IF;
-- Check if we've already populated data for this user
SELECT EXISTS(
        SELECT 1
        FROM visits
        WHERE user_id = NEW.user_id
        LIMIT 1
    ) INTO user_already_populated;
IF user_already_populated THEN RAISE NOTICE 'Demo user data already populated, skipping...';
RETURN NEW;
END IF;
RAISE NOTICE 'Populating demo user data for first-time login...';
-- Fetch product IDs
SELECT array_agg(id) INTO product_ids
FROM products
WHERE organization_id = demo_org_id
LIMIT 8;
-- Fetch doctor contact IDs
SELECT array_agg(id) INTO doctor_ids
FROM contacts
WHERE organization_id = demo_org_id
    AND contact_type = 'doctor'
    AND status = 'active'
LIMIT 12;
-- 1. Create Inventory (8 products with stock)
FOR i IN 1..LEAST(array_length(product_ids, 1), 8) LOOP
INSERT INTO inventario_muestras (
        id,
        user_id,
        product_id,
        organization_id,
        cantidad_asignada,
        cantidad_utilizada,
        cantidad_disponible,
        lote,
        fecha_vencimiento,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        product_ids [i],
        demo_org_id,
        150,
        -- assigned
        50 + (i * 10),
        -- used (varies by product)
        100 - (i * 10),
        -- available
        'LOT-2024-' || LPAD(i::TEXT, 3, '0'),
        (NOW() + INTERVAL '12 months')::DATE,
        NOW() - INTERVAL '60 days'
    );
END LOOP;
RAISE NOTICE '✓ Created inventory for 8 products';
-- 2. Create Past Visits (12 completed visits in last 30 days)
FOR i IN 1..12 LOOP
INSERT INTO visits (
        id,
        user_id,
        contact_id,
        organization_id,
        scheduled_date,
        actual_start_time,
        actual_end_time,
        status,
        visit_type,
        notes,
        objectives_met,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        doctor_ids [((i - 1) % array_length(doctor_ids, 1)) + 1],
        demo_org_id,
        (
            NOW() - INTERVAL '30 days' + (i * INTERVAL '2.5 days')
        )::TIMESTAMP,
        (
            NOW() - INTERVAL '30 days' + (i * INTERVAL '2.5 days')
        )::TIMESTAMP,
        (
            NOW() - INTERVAL '30 days' + (i * INTERVAL '2.5 days') + INTERVAL '18 minutes'
        )::TIMESTAMP,
        'completed',
        'routine',
        CASE
            WHEN i % 3 = 0 THEN 'Médico muy receptivo. Solicitó muestras de Atorvastatina. Mencionó interés en nuevos tratamientos para hipertensión.'
            WHEN i % 3 = 1 THEN 'Visita productiva. Se entregaron muestras de productos respiratorios. Doctor confirmó que prescribirá para próximos pacientes.'
            ELSE 'Reunión breve pero efectiva. Doctor actualizó su conocimiento sobre nuestros productos. Programada visita de seguimiento.'
        END,
        CASE
            WHEN i % 4 = 0 THEN false
            ELSE true
        END,
        NOW() - INTERVAL '30 days' + (i * INTERVAL '2.5 days')
    );
END LOOP;
RAISE NOTICE '✓ Created 12 completed visits';
-- 3. Create Today's Visits (3 scheduled for today)
-- Morning visit
INSERT INTO visits (
        id,
        user_id,
        contact_id,
        organization_id,
        scheduled_date,
        status,
        visit_type,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        doctor_ids [1],
        demo_org_id,
        (CURRENT_DATE + TIME '09:30:00')::TIMESTAMP,
        'confirmed',
        'routine',
        'Visita programada - Presentación de nuevo producto cardiovascular',
        NOW()
    );
-- Afternoon visit
INSERT INTO visits (
        id,
        user_id,
        contact_id,
        organization_id,
        scheduled_date,
        status,
        visit_type,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        doctor_ids [2],
        demo_org_id,
        (CURRENT_DATE + TIME '14:00:00')::TIMESTAMP,
        'confirmed',
        'followup',
        'Seguimiento de prescripciones anteriores',
        NOW()
    );
-- Evening visit
INSERT INTO visits (
        id,
        user_id,
        contact_id,
        organization_id,
        scheduled_date,
        status,
        visit_type,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        doctor_ids [3],
        demo_org_id,
        (CURRENT_DATE + TIME '17:30:00')::TIMESTAMP,
        'pending',
        'routine',
        'Primera visita - Establecer relación profesional',
        NOW()
    );
RAISE NOTICE '✓ Created 3 visits for today';
-- 4. Create Future Visits (8 in next 7 days)
FOR i IN 1..8 LOOP
INSERT INTO visits (
        id,
        user_id,
        contact_id,
        organization_id,
        scheduled_date,
        status,
        visit_type,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        doctor_ids [((i + 2) % array_length(doctor_ids, 1)) + 1],
        demo_org_id,
        (
            CURRENT_DATE + (i || ' days')::INTERVAL + TIME '10:00:00'
        )::TIMESTAMP,
        CASE
            WHEN i % 2 = 0 THEN 'confirmed'
            ELSE 'pending'
        END,
        CASE
            WHEN i % 3 = 0 THEN 'followup'
            ELSE 'routine'
        END,
        'Visita programada',
        NOW()
    );
END LOOP;
RAISE NOTICE '✓ Created 8 future visits';
-- 5. Create Monthly Objectives (4 active objectives)
INSERT INTO objectives (
        id,
        user_id,
        organization_id,
        title,
        description,
        metric_type,
        target_value,
        current_value,
        start_date,
        end_date,
        status,
        created_at
    )
VALUES (
        gen_random_uuid(),
        NEW.user_id,
        demo_org_id,
        'Visitas Mensuales',
        'Completar 60 visitas médicas este mes',
        'visits',
        60,
        47,
        DATE_TRUNC('month', CURRENT_DATE),
        (
            DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'
        )::DATE,
        'active',
        NOW()
    ),
    (
        gen_random_uuid(),
        NEW.user_id,
        demo_org_id,
        'Cobertura Territorial',
        'Contactar al 90% de médicos asignados',
        'coverage',
        40,
        34,
        DATE_TRUNC('month', CURRENT_DATE),
        (
            DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'
        )::DATE,
        'active',
        NOW()
    ),
    (
        gen_random_uuid(),
        NEW.user_id,
        demo_org_id,
        'Distribución de Muestras',
        'Distribuir 500 unidades de muestras médicas',
        'samples',
        500,
        450,
        DATE_TRUNC('month', CURRENT_DATE),
        (
            DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'
        )::DATE,
        'active',
        NOW()
    ),
    (
        gen_random_uuid(),
        NEW.user_id,
        demo_org_id,
        'Adopción Nuevo Producto',
        'Lograr que 15 médicos prescriban nuevo lanzamiento',
        'adoption',
        15,
        12,
        DATE_TRUNC('month', CURRENT_DATE),
        (
            DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'
        )::DATE,
        'active',
        NOW()
    );
RAISE NOTICE '✓ Created 4 monthly objectives';
RAISE NOTICE 'Demo user data population completed successfully!';
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to automatically populate data when demo user profile is created
DROP TRIGGER IF EXISTS trigger_populate_demo_data ON profiles;
CREATE TRIGGER trigger_populate_demo_data
AFTER
INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION populate_demo_user_data();
COMMENT ON FUNCTION populate_demo_user_data() IS 'Automatically populates demo data (visits, inventory, objectives) when demo user logs in for the first time';