-- =====================================================
-- COMPREHENSIVE DEMO SEED DATA - MediVisitPro
-- Date: 2026-01-11
-- Purpose: Create IMPRESSIVE demo with complete data
-- Organization: Demo Medical Corp (d3300000-0000-0000-0000-000000000001)
-- Demo User: demo.medivisitpro@gmail.com
-- =====================================================
-- This seed assumes the demo organization already exists from 20260101_seed_demo_complete.sql
-- We're populating it with realistic, impressive data
DO $$
DECLARE demo_org_id UUID := 'd3300000-0000-0000-0000-000000000001';
demo_user_id UUID;
-- Product IDs
product_atorva UUID;
product_losartan UUID;
product_amoxi UUID;
product_azitro UUID;
product_ibuprofen UUID;
product_diclo UUID;
product_metformin UUID;
product_gliben UUID;
product_omepra UUID;
product_ranitidina UUID;
product_salbutamol UUID;
product_loratadina UUID;
-- Doctor Contact IDs
doc_cardio1 UUID;
doc_cardio2 UUID;
doc_cardio3 UUID;
doc_pedia1 UUID;
doc_pedia2 UUID;
doc_gineco1 UUID;
doc_gineco2 UUID;
doc_general1 UUID;
doc_general2 UUID;
doc_general3 UUID;
doc_trauma1 UUID;
doc_trauma2 UUID;
doc_dermato1 UUID;
doc_dermato2 UUID;
doc_pendiente1 UUID;
-- Pharmacy IDs
pharma1 UUID;
pharma2 UUID;
pharma3 UUID;
pharma4 UUID;
pharma5 UUID;
pharma6 UUID;
pharma7 UUID;
pharma8 UUID;
-- Health Center IDs
hc1 UUID;
hc2 UUID;
hc3 UUID;
hc4 UUID;
hc5 UUID;
BEGIN -- Step 1: Get the demo user ID
SELECT id INTO demo_user_id
FROM auth.users
WHERE email = 'demo.medivisitpro@gmail.com'
LIMIT 1;
IF demo_user_id IS NULL THEN -- Fallback to first available user to avoid FK errors
SELECT id INTO demo_user_id
FROM auth.users
LIMIT 1;
END IF;
IF demo_user_id IS NULL THEN RAISE EXCEPTION 'No se encontro ningun usuario en auth.users. Por favor crea un usuario primero.';
END IF;
RAISE NOTICE 'Using user_id: %',
demo_user_id;
RAISE NOTICE '========================================';
RAISE NOTICE 'Starting MediVisitPro Demo Seed';
RAISE NOTICE '========================================';
-- Step 2: Create Products (12 impressive pharmaceutical products)
RAISE NOTICE 'Creating Products...';
INSERT INTO products (
        id,
        name,
        description,
        category,
        presentation,
        active_ingredients,
        organization_id,
        created_at
    )
VALUES (
        gen_random_uuid(),
        'Atorvastatina 20mg',
        'Tratamiento para hipercolesterolemia y prevención cardiovascular',
        'Cardiovascular',
        'Tabletas',
        ARRAY ['Atorvastatina'],
        demo_org_id,
        NOW() - INTERVAL '90 days'
    ),
    (
        gen_random_uuid(),
        'Losartán 50mg',
        'Antihipertensivo antagonista de receptores AT1',
        'Cardiovascular',
        'Tabletas',
        ARRAY ['Losartán'],
        demo_org_id,
        NOW() - INTERVAL '85 days'
    ),
    (
        gen_random_uuid(),
        'Amoxicilina 500mg',
        'Antibiótico betalactámico de amplio espectro',
        'Antibióticos',
        'Cápsulas',
        ARRAY ['Amoxicilina'],
        demo_org_id,
        NOW() - INTERVAL '80 days'
    ),
    (
        gen_random_uuid(),
        'Azitromicina 500mg',
        'Antibiótico macrólido para infecciones respiratorias',
        'Antibióticos',
        'Tabletas',
        ARRAY ['Azitromicina'],
        demo_org_id,
        NOW() - INTERVAL '75 days'
    ),
    (
        gen_random_uuid(),
        'Ibuprofeno 400mg',
        'Antiinflamatorio no esteroideo (AINE)',
        'Analgésicos',
        'Tabletas',
        ARRAY ['Ibuprofeno'],
        demo_org_id,
        NOW() - INTERVAL '70 days'
    ),
    (
        gen_random_uuid(),
        'Diclofenaco Gel 1%',
        'Antiinflamatorio tópico para dolor muscular',
        'Analgésicos',
        'Gel tópico 50g',
        ARRAY ['Diclofenaco'],
        demo_org_id,
        NOW() - INTERVAL '65 days'
    ),
    (
        gen_random_uuid(),
        'Metformina 850mg',
        'Antidiabético oral para diabetes tipo 2',
        'Antidiabéticos',
        'Tabletas',
        ARRAY ['Metformina'],
        demo_org_id,
        NOW() - INTERVAL '60 days'
    ),
    (
        gen_random_uuid(),
        'Glibenclamida 5mg',
        'Hipoglucemiante oral sulfonilurea',
        'Antidiabéticos',
        'Tabletas',
        ARRAY ['Glibenclamida'],
        demo_org_id,
        NOW() - INTERVAL '55 days'
    ),
    (
        gen_random_uuid(),
        'Omeprazol 20mg',
        'Inhibidor de bomba de protones para úlceras',
        'Gastrointestinal',
        'Cápsulas',
        ARRAY ['Omeprazol'],
        demo_org_id,
        NOW() - INTERVAL '50 days'
    ),
    (
        gen_random_uuid(),
        'Ranitidina 150mg',
        'Antagonista H2 para acidez estomacal',
        'Gastrointestinal',
        'Tabletas',
        ARRAY ['Ranitidina'],
        demo_org_id,
        NOW() - INTERVAL '45 days'
    ),
    (
        gen_random_uuid(),
        'Salbutamol Inhalador',
        'Broncodilatador para asma y EPOC',
        'Respiratorio',
        'Inhalador 200 dosis',
        ARRAY ['Salbutamol'],
        demo_org_id,
        NOW() - INTERVAL '40 days'
    ),
    (
        gen_random_uuid(),
        'Loratadina 10mg',
        'Antihistamínico de segunda generación',
        'Respiratorio',
        'Tabletas',
        ARRAY ['Loratadina'],
        demo_org_id,
        NOW() - INTERVAL '35 days'
    );
-- Get product IDs for later use
SELECT id INTO product_atorva
FROM products
WHERE name = 'Atorvastatina 20mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_losartan
FROM products
WHERE name = 'Losartán 50mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_amoxi
FROM products
WHERE name = 'Amoxicilina 500mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_azitro
FROM products
WHERE name = 'Azitromicina 500mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_ibuprofen
FROM products
WHERE name = 'Ibuprofeno 400mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_diclo
FROM products
WHERE name = 'Diclofenaco Gel 1%'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_metformin
FROM products
WHERE name = 'Metformina 850mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_gliben
FROM products
WHERE name = 'Glibenclamida 5mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_omepra
FROM products
WHERE name = 'Omeprazol 20mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_ranitidina
FROM products
WHERE name = 'Ranitidina 150mg'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_salbutamol
FROM products
WHERE name = 'Salbutamol Inhalador'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO product_loratadina
FROM products
WHERE name = 'Loratadina 10mg'
    AND organization_id = demo_org_id
LIMIT 1;
RAISE NOTICE '✓ Created 12 pharmaceutical products';
-- Step 3: Create Health Centers (5 impressive facilities)
RAISE NOTICE 'Creating Health Centers...';
INSERT INTO health_centers (
        id,
        user_id,
        name,
        facility_type,
        address,
        city,
        state,
        phone,
        organization_id,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        'Hospital General de México',
        'hospital',
        'Dr. Balmis No. 148, Col. Doctores',
        'Ciudad de México',
        'CDMX',
        '55-2789-2000',
        demo_org_id,
        NOW() - INTERVAL '180 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        'IMSS Centro Médico Nacional',
        'hospital',
        'Av. Cuauhtémoc 330, Col. Doctores',
        'Ciudad de México',
        'CDMX',
        '55-5627-6900',
        demo_org_id,
        NOW() - INTERVAL '175 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        'ISSSTE Hospital Regional 1º de Octubre',
        'hospital',
        'Av. Instituto Politécnico Nacional 1669',
        'Ciudad de México',
        'CDMX',
        '55-5729-6300',
        demo_org_id,
        NOW() - INTERVAL '170 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        'Clínica Santa Fe',
        'clinic',
        'Av. Vasco de Quiroga 4001, Santa Fe',
        'Ciudad de México',
        'CDMX',
        '55-5081-8600',
        demo_org_id,
        NOW() - INTERVAL '165 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        'Centro Médico ABC',
        'clinic',
        'Av. Carlos Graef Fernández 154, Santa Fe',
        'Ciudad de México',
        'CDMX',
        '55-1103-1600',
        demo_org_id,
        NOW() - INTERVAL '160 days'
    );
SELECT id INTO hc1
FROM health_centers
WHERE name = 'Hospital General de México'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO hc2
FROM health_centers
WHERE name = 'IMSS Centro Médico Nacional'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO hc3
FROM health_centers
WHERE name = 'ISSSTE Hospital Regional 1º de Octubre'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO hc4
FROM health_centers
WHERE name = 'Clínica Santa Fe'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO hc5
FROM health_centers
WHERE name = 'Centro Médico ABC'
    AND organization_id = demo_org_id
LIMIT 1;
RAISE NOTICE '✓ Created 5 health centers';
-- Step 4: Create Doctor Contacts (15 impressive doctors)
RAISE NOTICE 'Creating Doctors (in correct table)...';
-- Cardiologists (3)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        -- contact_type, -- Removed: implicit in table
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        -- Formerly priority
        observations,
        -- Formerly notes
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Carlos Mendoza Ruiz',
        'Cardiología',
        '55-1234-5678',
        'cmendoza@hospitalgral.mx',
        'Consultorio 405, Hospital General',
        'Ciudad de México',
        'CDMX',
        'Alto',
        -- Formerly high
        'Especialista en hipertensión. Muy receptivo a nuevos tratamientos cardiovasculares.',
        NOW() - INTERVAL '120 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dra. Ana Patricia Torres',
        'Cardiología',
        '55-2345-6789',
        'aptorres@imss.gob.mx',
        'Consultorio 302, IMSS CMN',
        'Ciudad de México',
        'CDMX',
        'Alto',
        -- Formerly high
        'Jefa de cardiología. Interesada en estatinas de nueva generación.',
        NOW() - INTERVAL '115 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Roberto Sánchez Mora',
        'Cardiología',
        '55-3456-7890',
        'rsanchez@clinicasantafe.com',
        'Torre Médica, Piso 8',
        'Ciudad de México',
        'CDMX',
        'Medio',
        -- Formerly medium
        'Consulta privada. Prescribe frecuentemente antihipertensivos.',
        NOW() - INTERVAL '110 days'
    );
-- Pediatricians (2)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        observations,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dra. Laura Martínez Campos',
        'Pediatría',
        '55-4567-8901',
        'lmartinez@pediatriahgm.mx',
        'Área de Pediatría, HGM',
        'Ciudad de México',
        'CDMX',
        'Alto',
        'Especialista en infecciones respiratorias infantiles.',
        NOW() - INTERVAL '105 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Miguel Ángel Ramos',
        'Pediatría',
        '55-5678-9012',
        'maramos@outlook.com',
        'Consultorio Privado, Col. Roma',
        'Ciudad de México',
        'CDMX',
        'Medio',
        'Consulta privada pediátrica. Prescribe antibióticos frecuentemente.',
        NOW() - INTERVAL '100 days'
    );
-- Gynecologists (2)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        observations,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        -- Fixed typo in original seed (was demo_user_id)
        'Dra. Patricia Hernández López',
        'Ginecología',
        '55-6789-0123',
        'phernandez@issste.gob.mx',
        'Ginecología, ISSSTE Regional',
        'Ciudad de México',
        'CDMX',
        'Alto',
        'Especialista en salud reproductiva.',
        NOW() - INTERVAL '95 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Fernando Ortiz Delgado',
        'Ginecología',
        '55-7890-1234',
        'fortiz@abc.org.mx',
        'Centro Médico ABC',
        'Ciudad de México',
        'CDMX',
        'Alto',
        'Ginecólogo obstetra de alto prestigio.',
        NOW() - INTERVAL '90 days'
    );
-- General Medicine (3)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        observations,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        -- Fixed typo in original seed
        'Dr. José Luis Ramírez',
        'Medicina General',
        '55-8901-2345',
        'jlramirez@gmail.com',
        'Consultorio Col. Condesa',
        'Ciudad de México',
        'CDMX',
        'Medio',
        'Médico general con amplia base de pacientes.',
        NOW() - INTERVAL '85 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dra. María Elena Castro',
        'Medicina General',
        '55-9012-3456',
        'mecastro@yahoo.com',
        'Consultorio Col. Del Valle',
        'Ciudad de México',
        'CDMX',
        'Medio',
        'Medicina familiar. Muy organizada en su práctica.',
        NOW() - INTERVAL '80 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Alberto Gómez Vega',
        'Medicina General',
        '55-0123-4567',
        'agomez@medico.com',
        'Consultorio Col. Polanco',
        'Ciudad de México',
        'CDMX',
        'Bajo',
        -- Formerly low
        'Consulta general ambulatoria.',
        NOW() - INTERVAL '75 days'
    );
-- Traumatologists (2)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        observations,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Ricardo Flores Mendoza',
        'Traumatología',
        '55-1111-2222',
        'rflores@traumato.mx',
        'Hospital de Traumatología',
        'Ciudad de México',
        'CDMX',
        'Alto',
        'Cirujano traumatólogo. Prescribe antiinflamatorios frecuentemente.',
        NOW() - INTERVAL '70 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dra. Sandra Morales Ríos',
        'Traumatología',
        '55-2222-3333',
        'smorales@ortopedia.com',
        'Clínica Ortopédica',
        'Ciudad de México',
        'CDMX',
        'Medio',
        'Especialista en deportología.',
        NOW() - INTERVAL '65 days'
    );
-- Dermatologists (2)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        observations,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dra. Gabriela Rojas Silva',
        'Dermatología',
        '55-3333-4444',
        'grojas@derma.mx',
        'Clínica Dermatológica',
        'Ciudad de México',
        'CDMX',
        'Medio',
        'Dermatóloga clínica y estética.',
        NOW() - INTERVAL '60 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Eduardo Vargas León',
        'Dermatología',
        '55-4444-5555',
        'evargas@skincare.com',
        'Centro Dermatológico',
        'Ciudad de México',
        'CDMX',
        'Bajo',
        'Dermatología general.',
        NOW() - INTERVAL '55 days'
    );
-- Pending first contact (1)
INSERT INTO doctors (
        id,
        user_id,
        organization_id,
        name,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        potential,
        observations,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Dr. Antonio Cervantes Palacios',
        'Medicina Interna',
        '55-5555-6666',
        'acervantes@hospital.mx',
        'Hospital Regional',
        'Tlalnepantla',
        'Estado de México',
        'Medio',
        'Nuevo contacto. Pendiente primera visita.',
        NOW() - INTERVAL '10 days'
    );
RAISE NOTICE '✓ Created 15 doctor contacts';
-- Get doctor IDs for visits (from DOCTORS table now)
SELECT id INTO doc_cardio1
FROM doctors
WHERE name = 'Dr. Carlos Mendoza Ruiz'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO doc_cardio2
FROM doctors
WHERE name = 'Dra. Ana Patricia Torres'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO doc_cardio3
FROM doctors
WHERE name = 'Dr. Roberto Sánchez Mora'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO doc_pedia1
FROM doctors
WHERE name = 'Dra. Laura Martínez Campos'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO doc_pedia2
FROM doctors
WHERE name = 'Dr. Miguel Ángel Ramos'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO doc_general1
FROM doctors
WHERE name = 'Dr. José Luis Ramírez'
    AND organization_id = demo_org_id
LIMIT 1;
SELECT id INTO doc_general2
FROM doctors
WHERE name = 'Dra. María Elena Castro'
    AND organization_id = demo_org_id
LIMIT 1;
-- Step 5: Create Pharmacies (8 realistic chains and independents)
RAISE NOTICE 'Creating Pharmacies...';
INSERT INTO pharmacies (
        id,
        user_id,
        organization_id,
        name,
        address,
        city,
        state,
        phone,
        contact_name,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Farmacia del Ahorro Centro',
        'Av. Juárez 102, Centro',
        'Ciudad de México',
        'CDMX',
        '55-1111-0000',
        'Lic. María Rodríguez',
        'Activo',
        'Sucursal con alto volumen de ventas.',
        NOW() - INTERVAL '200 days'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        demo_org_id,
        'Farmacia del Ahorro Polanco',