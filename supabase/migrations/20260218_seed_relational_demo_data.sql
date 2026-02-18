-- ==============================================================================
-- SEMILLA DE DATOS RELACIONALES PARA DEMO 2026 (CORREGIDA V4 - PROFILE LINK)
-- ==============================================================================
-- Fecha: 18/02/2026
-- Propósito: Cargar datos de demostración respetando que 'contacts' es la tabla maestra.
--            1. Inserta en 'contacts' primero.
--            2. Inserta en 'doctors'/'pharmacies' usando el mismo ID.
--            3. Crea relaciones (horarios) usando ese ID.
--            4. VINCULA el perfil de usuario a la organización demo para visibilidad.
-- ==============================================================================
DO $$
DECLARE -- IDs para Health Centers
    v_hc_hospital_id UUID := 'a0000000-0000-0000-0000-000000000001';
v_hc_clinica_id UUID := 'a0000000-0000-0000-0000-000000000002';
-- IDs para Doctores (usaremos estos para contacts Y doctors)
v_doc_pediatra_id UUID := 'b0000000-0000-0000-0000-000000000001';
v_doc_cardio_id UUID := 'b0000000-0000-0000-0000-000000000002';
v_doc_general_id UUID := 'b0000000-0000-0000-0000-000000000003';
-- IDs para Farmacias (contacts Y pharmacies)
v_pharm_ahorro_id UUID := 'c0000000-0000-0000-0000-000000000001';
v_pharm_guadalajara_id UUID := 'c0000000-0000-0000-0000-000000000002';
-- IDs para Droguerías (contacts)
v_drug_central_id UUID := 'd0000000-0000-0000-0000-000000000001';
-- IDs para Tiendas Naturistas (contacts)
v_natural_vida_id UUID := 'e0000000-0000-0000-0000-000000000001';
-- Variables de entorno
demo_org_id UUID;
demo_user_id UUID;
v_zone_norte_id UUID;
v_zone_sur_id UUID;
BEGIN -- 1. OBTENER O CREAR ORG ID
SELECT id INTO demo_org_id
FROM organizations
WHERE slug = 'demo-medical-corp'
LIMIT 1;
-- Si no existe, crearla dinámicamente en lugar de usar un ID fijo que puede no existir
IF demo_org_id IS NULL THEN RAISE NOTICE 'Organización demo no encontrada. Creando...';
INSERT INTO organizations (name, slug, plan_tier, subscription_status)
VALUES (
        'Demo Medical Corp',
        'demo-medical-corp',
        'enterprise',
        'active'
    )
RETURNING id INTO demo_org_id;
END IF;
-- 2. OBTENER USER ID
SELECT id INTO demo_user_id
FROM auth.users
WHERE email = 'demo@medivisitpro.com'
LIMIT 1;
-- Si no existe el usuario específico, usar cualquier usuario existente (fallback seguro)
IF demo_user_id IS NULL THEN
SELECT id INTO demo_user_id
FROM auth.users
LIMIT 1;
END IF;
-- Validación final para evitar errores de restricción NOT NULL
IF demo_org_id IS NULL
OR demo_user_id IS NULL THEN RAISE EXCEPTION 'No se pudo obtener una Organización o Usuario válido. Org: %, User: %',
demo_org_id,
demo_user_id;
END IF;
-- CRITICO: Actualizar el perfil del usuario para que apunte a esta organización
-- De lo contrario, las políticas RLS evitarán que vea los datos insertados
UPDATE profiles
SET organization_id = demo_org_id,
    is_org_admin = true
WHERE id = demo_user_id;
RAISE NOTICE 'Sembrando datos para Org: % (%), User: % (Perfil actualizado)',
demo_org_id,
'demo-medical-corp',
demo_user_id;
-- 2. LIMPIEZA PREVIA (Opcional, borrar datos de demo anteriores)
DELETE FROM doctor_schedules
WHERE health_center_id IN (v_hc_hospital_id, v_hc_clinica_id);
DELETE FROM health_centers
WHERE id IN (v_hc_hospital_id, v_hc_clinica_id);
DELETE FROM doctors
WHERE id IN (
        v_doc_pediatra_id,
        v_doc_cardio_id,
        v_doc_general_id
    );
DELETE FROM pharmacies
WHERE id IN (v_pharm_ahorro_id, v_pharm_guadalajara_id);
DELETE FROM contacts
WHERE id IN (
        v_doc_pediatra_id,
        v_doc_cardio_id,
        v_doc_general_id,
        v_pharm_ahorro_id,
        v_pharm_guadalajara_id,
        v_drug_central_id,
        v_natural_vida_id
    );
-- Borrar generados aleatorios previos
DELETE FROM contacts
WHERE email LIKE '%@demo-relleno.com';
-- 3. ZONAS (Asegurar que existan)
INSERT INTO zones (name, organization_id)
VALUES ('Zona Norte', demo_org_id) ON CONFLICT DO NOTHING;
INSERT INTO zones (name, organization_id)
VALUES ('Zona Sur', demo_org_id) ON CONFLICT DO NOTHING;
SELECT id INTO v_zone_norte_id
FROM zones
WHERE name = 'Zona Norte'
    AND organization_id = demo_org_id;
SELECT id INTO v_zone_sur_id
FROM zones
WHERE name = 'Zona Sur'
    AND organization_id = demo_org_id;
-- 4. INSERTAR CONTACTOS MAESTROS (DOCTORES)
-- Es crucial insertar en contacts primero para satisfacer la FK de doctor_schedules (si apunta a contacts)
INSERT INTO contacts (
        id,
        user_id,
        organization_id,
        name,
        contact_type,
        email,
        phone,
        specialty
    )
VALUES (
        v_doc_pediatra_id,
        demo_user_id,
        demo_org_id,
        'Dra. Ana López (Pediatra)',
        'doctor',
        'ana@demo.com',
        '55-1000',
        'Pediatría'
    ),
    (
        v_doc_cardio_id,
        demo_user_id,
        demo_org_id,
        'Dr. Jorge Pérez (Cardiólogo)',
        'doctor',
        'jorge@demo.com',
        '55-2000',
        'Cardiología'
    ),
    (
        v_doc_general_id,
        demo_user_id,
        demo_org_id,
        'Dr. Luis García (General)',
        'doctor',
        'luis@demo.com',
        '55-3000',
        'General'
    );
-- 5. INSERTAR DETALLES DE DOCTORES (Tabla doctors)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        email,
        phone,
        zone_id,
        potential
    )
VALUES (
        v_doc_pediatra_id,
        demo_user_id,
        demo_org_id,
        'Dra. Ana López (Pediatra)',
        'Pediatría',
        'ana@demo.com',
        '55-1000',
        v_zone_sur_id,
        'Alto'
    ),
    (
        v_doc_cardio_id,
        demo_user_id,
        demo_org_id,
        'Dr. Jorge Pérez (Cardiólogo)',
        'Cardiología',
        'jorge@demo.com',
        '55-2000',
        v_zone_sur_id,
        'Alto'
    ),
    (
        v_doc_general_id,
        demo_user_id,
        demo_org_id,
        'Dr. Luis García (General)',
        'General',
        'luis@demo.com',
        '55-3000',
        v_zone_sur_id,
        'Medio'
    );
-- 6. INSERTAR CENTROS DE SALUD
INSERT INTO health_centers (
        id,
        user_id,
        organization_id,
        name,
        facility_type,
        zone_id
    )
VALUES (
        v_hc_hospital_id,
        demo_user_id,
        demo_org_id,
        'Hospital General Metropolitano',
        'Hospital',
        v_zone_norte_id
    ),
    (
        v_hc_clinica_id,
        demo_user_id,
        demo_org_id,
        'Clínica Familiar San José',
        'Clínica',
        v_zone_sur_id
    );
-- 7. INSERTAR HORARIOS (DOCTOR SCHEDULES)
-- Ahora v_doc_*_id existe en 'contacts' (y 'doctors'), así que la FK funcionará sin importar a cuál apunte.
INSERT INTO doctor_schedules (
        doctor_id,
        user_id,
        health_center_id,
        dias_atencion,
        hora_inicio,
        hora_fin,
        activo
    )
VALUES (
        v_doc_pediatra_id,
        demo_user_id,
        v_hc_clinica_id,
        'Lunes, Miércoles, Viernes',
        '09:00',
        '13:00',
        true
    ),
    (
        v_doc_cardio_id,
        demo_user_id,
        v_hc_hospital_id,
        'Martes, Jueves',
        '10:00',
        '16:00',
        true
    ),
    (
        v_doc_general_id,
        demo_user_id,
        v_hc_hospital_id,
        'Lunes a Viernes',
        '08:00',
        '15:00',
        true
    );
-- 8. CONTACTOS MAESTROS (FARMACIAS)
INSERT INTO contacts (
        id,
        user_id,
        organization_id,
        name,
        contact_type,
        address,
        city
    )
VALUES (
        v_pharm_ahorro_id,
        demo_user_id,
        demo_org_id,
        'Farmacia del Ahorro - Plaza Norte',
        'pharmacy',
        'Centro Comercial Norte',
        'Ciudad Demo'
    ),
    (
        v_pharm_guadalajara_id,
        demo_user_id,
        demo_org_id,
        'Farmacia Guadalajara - Centro',
        'pharmacy',
        'Av. Principal 123',
        'Ciudad Demo'
    );
-- 9. DETALLES DE FARMACIAS (Tabla pharmacies)
INSERT INTO pharmacies (
        id,
        user_id,
        organization_id,
        name,
        address,
        city,
        zone_id
    )
VALUES (
        v_pharm_ahorro_id,
        demo_user_id,
        demo_org_id,
        'Farmacia del Ahorro - Plaza Norte',
        'Centro Comercial Norte',
        'Ciudad Demo',
        v_zone_norte_id
    ),
    (
        v_pharm_guadalajara_id,
        demo_user_id,
        demo_org_id,
        'Farmacia Guadalajara - Centro',
        'Av. Principal 123',
        'Ciudad Demo',
        v_zone_sur_id
    );
-- 10. GENERAR DOCTORES DE RELLENO (10 Registros)
-- Usamos un bucle para insertar en ambas tablas
FOR i IN 1..10 LOOP
DECLARE new_id UUID := gen_random_uuid();
BEGIN -- Insertar en contacts
INSERT INTO contacts (
        id,
        user_id,
        organization_id,
        name,
        contact_type,
        email,
        specialty
    )
VALUES (
        new_id,
        demo_user_id,
        demo_org_id,
        'Dr. Demo Relleno ' || i,
        'doctor',
        'relleno' || i || '@demo-relleno.com',
        'General'
    );
-- Insertar en doctors
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        zone_id
    )
VALUES (
        new_id,
        demo_user_id,
        demo_org_id,
        'Dr. Demo Relleno ' || i,
        'General',
        v_zone_norte_id
    );
-- Insertar horario
INSERT INTO doctor_schedules (
        doctor_id,
        user_id,
        health_center_id,
        dias_atencion,
        hora_inicio,
        hora_fin,
        activo
    )
VALUES (
        new_id,
        demo_user_id,
        v_hc_hospital_id,
        'Lunes a Viernes',
        '08:00',
        '14:00',
        true
    );
END;
END LOOP;
RAISE NOTICE 'Carga de datos relacionales completada exitosamente.';
END $$;