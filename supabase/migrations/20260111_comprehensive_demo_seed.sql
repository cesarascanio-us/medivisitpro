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
BEGIN -- Step 1: Get the demo user ID (will be created when user first logs in)
-- For now, we'll use a placeholder and the data will be linked when user logs in
-- Actually, let's check if the user exists in auth.users first
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
        active_ingredient,
        organization_id,
        created_at
    )
VALUES (
        gen_random_uuid(),
        'Atorvastatina 20mg',
        'Tratamiento para hipercolesterolemia y prevención cardiovascular',
        'Cardiovascular',
        'Tabletas',
        'Atorvastatina',
        demo_org_id,
        NOW() - INTERVAL '90 days'
    ),
    (
        gen_random_uuid(),
        'Losartán 50mg',
        'Antihipertensivo antagonista de receptores AT1',
        'Cardiovascular',
        'Tabletas',
        'Losartán',
        demo_org_id,
        NOW() - INTERVAL '85 days'
    ),
    (
        gen_random_uuid(),
        'Amoxicilina 500mg',
        'Antibiótico betalactámico de amplio espectro',
        'Antibióticos',
        'Cápsulas',
        'Amoxicilina',
        demo_org_id,
        NOW() - INTERVAL '80 days'
    ),
    (
        gen_random_uuid(),
        'Azitromicina 500mg',
        'Antibiótico macrólido para infecciones respiratorias',
        'Antibióticos',
        'Tabletas',
        'Azitromicina',
        demo_org_id,
        NOW() - INTERVAL '75 days'
    ),
    (
        gen_random_uuid(),
        'Ibuprofeno 400mg',
        'Antiinflamatorio no esteroideo (AINE)',
        'Analgésicos',
        'Tabletas',
        'Ibuprofeno',
        demo_org_id,
        NOW() - INTERVAL '70 days'
    ),
    (
        gen_random_uuid(),
        'Diclofenaco Gel 1%',
        'Antiinflamatorio tópico para dolor muscular',
        'Analgésicos',
        'Gel tópico 50g',
        'Diclofenaco',
        demo_org_id,
        NOW() - INTERVAL '65 days'
    ),
    (
        gen_random_uuid(),
        'Metformina 850mg',
        'Antidiabético oral para diabetes tipo 2',
        'Antidiabéticos',
        'Tabletas',
        'Metformina',
        demo_org_id,
        NOW() - INTERVAL '60 days'
    ),
    (
        gen_random_uuid(),
        'Glibenclamida 5mg',
        'Hipoglucemiante oral sulfonilurea',
        'Antidiabéticos',
        'Tabletas',
        'Glibenclamida',
        demo_org_id,
        NOW() - INTERVAL '55 days'
    ),
    (
        gen_random_uuid(),
        'Omeprazol 20mg',
        'Inhibidor de bomba de protones para úlceras',
        'Gastrointestinal',
        'Cápsulas',
        'Omeprazol',
        demo_org_id,
        NOW() - INTERVAL '50 days'
    ),
    (
        gen_random_uuid(),
        'Ranitidina 150mg',
        'Antagonista H2 para acidez estomacal',
        'Gastrointestinal',
        'Tabletas',
        'Ranitidina',
        demo_org_id,
        NOW() - INTERVAL '45 days'
    ),
    (
        gen_random_uuid(),
        'Salbutamol Inhalador',
        'Broncodilatador para asma y EPOC',
        'Respiratorio',
        'Inhalador 200 dosis',
        'Salbutamol',
        demo_org_id,
        NOW() - INTERVAL '40 days'
    ),
    (
        gen_random_uuid(),
        'Loratadina 10mg',
        'Antihistamínico de segunda generación',
        'Respiratorio',
        'Tabletas',
        'Loratadina',
        demo_org_id,
        NOW() - INTERVAL '35 days'
    )
RETURNING id INTO product_atorva;
-- Get product IDs for later use
SELECT id INTO product_atorva
FROM products
WHERE name = 'Atorvastatina 20mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_losartan
FROM products
WHERE name = 'Losartán 50mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_amoxi
FROM products
WHERE name = 'Amoxicilina 500mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_azitro
FROM products
WHERE name = 'Azitromicina 500mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_ibuprofen
FROM products
WHERE name = 'Ibuprofeno 400mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_diclo
FROM products
WHERE name = 'Diclofenaco Gel 1%'
    AND organization_id = demo_org_id;
SELECT id INTO product_metformin
FROM products
WHERE name = 'Metformina 850mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_gliben
FROM products
WHERE name = 'Glibenclamida 5mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_omepra
FROM products
WHERE name = 'Omeprazol 20mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_ranitidina
FROM products
WHERE name = 'Ranitidina 150mg'
    AND organization_id = demo_org_id;
SELECT id INTO product_salbutamol
FROM products
WHERE name = 'Salbutamol Inhalador'
    AND organization_id = demo_org_id;
SELECT id INTO product_loratadina
FROM products
WHERE name = 'Loratadina 10mg'
    AND organization_id = demo_org_id;
RAISE NOTICE '✓ Created 12 pharmaceutical products';
-- Step 3: Create Health Centers (5 impressive facilities)
RAISE NOTICE 'Creating Health Centers...';
INSERT INTO health_centers (
        id,
        name,
        type,
        address,
        city,
        state,
        phone,
        organization_id,
        created_at
    )
VALUES (
        gen_random_uuid(),
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
        'Centro Médico ABC',
        'clinic',
        'Av. Carlos Graef Fernández 154, Santa Fe',
        'Ciudad de México',
        'CDMX',
        '55-1103-1600',
        demo_org_id,
        NOW() - INTERVAL '160 days'
    )
RETURNING id INTO hc1;
SELECT id INTO hc1
FROM health_centers
WHERE name = 'Hospital General de México'
    AND organization_id = demo_org_id;
SELECT id INTO hc2
FROM health_centers
WHERE name = 'IMSS Centro Médico Nacional'
    AND organization_id = demo_org_id;
SELECT id INTO hc3
FROM health_centers
WHERE name = 'ISSSTE Hospital Regional 1º de Octubre'
    AND organization_id = demo_org_id;
SELECT id INTO hc4
FROM health_centers
WHERE name = 'Clínica Santa Fe'
    AND organization_id = demo_org_id;
SELECT id INTO hc5
FROM health_centers
WHERE name = 'Centro Médico ABC'
    AND organization_id = demo_org_id;
RAISE NOTICE '✓ Created 5 health centers';
-- Step 4: Create Doctor Contacts (15 impressive doctors)
RAISE NOTICE 'Creating Doctor Contacts...';
-- Cardiologists (3)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Carlos Mendoza Ruiz',
        'doctor',
        'Cardiología',
        '55-1234-5678',
        'cmendoza@hospitalgral.mx',
        'Consultorio 405, Hospital General',
        'Ciudad de México',
        'CDMX',
        'A',
        'active',
        'Especialista en hipertensión. Muy receptivo a nuevos tratamientos cardiovasculares.',
        NOW() - INTERVAL '120 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dra. Ana Patricia Torres',
        'doctor',
        'Cardiología',
        '55-2345-6789',
        'aptorres@imss.gob.mx',
        'Consultorio 302, IMSS CMN',
        'Ciudad de México',
        'CDMX',
        'A',
        'active',
        'Jefa de cardiología. Interesada en estatinas de nueva generación.',
        NOW() - INTERVAL '115 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Roberto Sánchez Mora',
        'doctor',
        'Cardiología',
        '55-3456-7890',
        'rsanchez@clinicasantafe.com',
        'Torre Médica, Piso 8',
        'Ciudad de México',
        'CDMX',
        'B',
        'active',
        'Consulta privada. Prescribe frecuentemente antihipertensivos.',
        NOW() - INTERVAL '110 days'
    );
-- Pediatricians (2)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dra. Laura Martínez Campos',
        'doctor',
        'Pediatría',
        '55-4567-8901',
        'lmartinez@pediatriahgm.mx',
        'Área de Pediatría, HGM',
        'Ciudad de México',
        'CDMX',
        'A',
        'active',
        'Especialista en infecciones respiratorias infantiles.',
        NOW() - INTERVAL '105 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Miguel Ángel Ramos',
        'doctor',
        'Pediatría',
        '55-5678-9012',
        'maramos@outlook.com',
        'Consultorio Privado, Col. Roma',
        'Ciudad de México',
        'CDMX',
        'B',
        'active',
        'Consulta privada pediátrica. Prescribe antibióticos frecuentemente.',
        NOW() - INTERVAL '100 days'
    );
-- Gynecologists (2)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dra. Patricia Hernández López',
        'doctor',
        'Ginecología',
        '55-6789-0123',
        'phernandez@issste.gob.mx',
        'Ginecología, ISSSTE Regional',
        'Ciudad de México',
        'CDMX',
        'A',
        'active',
        'Especialista en salud reproductiva.',
        NOW() - INTERVAL '95 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Fernando Ortiz Delgado',
        'doctor',
        'Ginecología',
        '55-7890-1234',
        'fortiz@abc.org.mx',
        'Centro Médico ABC',
        'Ciudad de México',
        'CDMX',
        'A',
        'active',
        'Ginecólogo obstetra de alto prestigio.',
        NOW() - INTERVAL '90 days'
    );
-- General Medicine (3)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dr. José Luis Ramírez',
        'doctor',
        'Medicina General',
        '55-8901-2345',
        'jlramirez@gmail.com',
        'Consultorio Col. Condesa',
        'Ciudad de México',
        'CDMX',
        'B',
        'active',
        'Médico general con amplia base de pacientes.',
        NOW() - INTERVAL '85 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dra. María Elena Castro',
        'doctor',
        'Medicina General',
        '55-9012-3456',
        'mecastro@yahoo.com',
        'Consultorio Col. Del Valle',
        'Ciudad de México',
        'CDMX',
        'B',
        'active',
        'Medicina familiar. Muy organizada en su práctica.',
        NOW() - INTERVAL '80 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Alberto Gómez Vega',
        'doctor',
        'Medicina General',
        '55-0123-4567',
        'agomez@medico.com',
        'Consultorio Col. Polanco',
        'Ciudad de México',
        'CDMX',
        'C',
        'active',
        'Consulta general ambulatoria.',
        NOW() - INTERVAL '75 days'
    );
-- Traumatologists (2)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Ricardo Flores Mendoza',
        'doctor',
        'Traumatología',
        '55-1111-2222',
        'rflores@traumato.mx',
        'Hospital de Traumatología',
        'Ciudad de México',
        'CDMX',
        'A',
        'active',
        'Cirujano traumatólogo. Prescribe antiinflamatorios frecuentemente.',
        NOW() - INTERVAL '70 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dra. Sandra Morales Ríos',
        'doctor',
        'Traumatología',
        '55-2222-3333',
        'smorales@ortopedia.com',
        'Clínica Ortopédica',
        'Ciudad de México',
        'CDMX',
        'B',
        'active',
        'Especialista en deportología.',
        NOW() - INTERVAL '65 days'
    );
-- Dermatologists (2)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dra. Gabriela Rojas Silva',
        'doctor',
        'Dermatología',
        '55-3333-4444',
        'grojas@derma.mx',
        'Clínica Dermatológica',
        'Ciudad de México',
        'CDMX',
        'B',
        'active',
        'Dermatóloga clínica y estética.',
        NOW() - INTERVAL '60 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Eduardo Vargas León',
        'doctor',
        'Dermatología',
        '55-4444-5555',
        'evargas@skincare.com',
        'Centro Dermatológico',
        'Ciudad de México',
        'CDMX',
        'C',
        'active',
        'Dermatología general.',
        NOW() - INTERVAL '55 days'
    );
-- Pending first contact (1)
INSERT INTO contacts (
        id,
        organization_id,
        name,
        contact_type,
        specialty,
        phone,
        email,
        address,
        city,
        state,
        value_tier,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Dr. Antonio Cervantes Palacios',
        'doctor',
        'Medicina Interna',
        '55-5555-6666',
        'acervantes@hospital.mx',
        'Hospital Regional',
        'Tlalnepantla',
        'Estado de México',
        'B',
        'pending',
        'Nuevo contacto. Pendiente primera visita.',
        NOW() - INTERVAL '10 days'
    );
RAISE NOTICE '✓ Created 15 doctor contacts';
-- Get doctor IDs for visits
SELECT id INTO doc_cardio1
FROM contacts
WHERE name = 'Dr. Carlos Mendoza Ruiz'
    AND organization_id = demo_org_id;
SELECT id INTO doc_cardio2
FROM contacts
WHERE name = 'Dra. Ana Patricia Torres'
    AND organization_id = demo_org_id;
SELECT id INTO doc_cardio3
FROM contacts
WHERE name = 'Dr. Roberto Sánchez Mora'
    AND organization_id = demo_org_id;
SELECT id INTO doc_pedia1
FROM contacts
WHERE name = 'Dra. Laura Martínez Campos'
    AND organization_id = demo_org_id;
SELECT id INTO doc_pedia2
FROM contacts
WHERE name = 'Dr. Miguel Ángel Ramos'
    AND organization_id = demo_org_id;
SELECT id INTO doc_general1
FROM contacts
WHERE name = 'Dr. José Luis Ramírez'
    AND organization_id = demo_org_id;
SELECT id INTO doc_general2
FROM contacts
WHERE name = 'Dra. María Elena Castro'
    AND organization_id = demo_org_id;
-- Step 5: Create Pharmacies (8 realistic chains and independents)
RAISE NOTICE 'Creating Pharmacies...';
INSERT INTO pharmacies (
        id,
        organization_id,
        name,
        chain_name,
        address,
        city,
        state,
        phone,
        manager_name,
        status,
        notes,
        created_at
    )
VALUES (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia del Ahorro Centro',
        'Farmacias del Ahorro',
        'Av. Juárez 102, Centro',
        'Ciudad de México',
        'CDMX',
        '55-1111-0000',
        'Lic. María Rodríguez',
        'active',
        'Sucursal con alto volumen de ventas.',
        NOW() - INTERVAL '200 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia del Ahorro Polanco',
        'Farmacias del Ahorro',
        'Av. Presidente Masaryk 201',
        'Ciudad de México',
        'CDMX',
        '55-1111-0001',
        'Lic. Roberto Pérez',
        'active',
        'Zona de alto poder adquisitivo.',
        NOW() - INTERVAL '195 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia Guadalajara Roma',
        'Farmacias Guadalajara',
        'Av. Insurgentes Sur 300, Roma',
        'Ciudad de México',
        'CDMX',
        '55-2222-0000',
        'Lic. Carmen Soto',
        'active',
        'Sucursal estratégica en zona residencial.',
        NOW() - INTERVAL '190 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia Guadalajara Satélite',
        'Farmacias Guadalajara',
        'Circuito Centro Comercial',
        'Naucalpan',
        'Estado de México',
        '55-2222-0001',
        'Lic. Jorge Mendoza',
        'active',
        'Alto tráfico en centro comercial.',
        NOW() - INTERVAL '185 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia San Pablo',
        'Farmacia San Pablo',
        'Av. Universidad 1500',
        'Ciudad de México',
        'CDMX',
        '55-3333-0000',
        'Lic. Ana López',
        'active',
        'Cadena regional competitiva.',
        NOW() - INTERVAL '180 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia Independiente La Salud',
        NULL,
        'Calle Morelos 45, Col. Centro',
        'Toluca',
        'Estado de México',
        '722-123-4567',
        'Q.F.B. Luis García',
        'active',
        'Farmacia familiar tradicional.',
        NOW() - INTERVAL '175 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia Cruz Verde',
        NULL,
        'Av. Reforma 890',
        'Ciudad de México',
        'CDMX',
        '55-4444-0000',
        'Q.F.B. Patricia Ruiz',
        'active',
        'Farmacia independiente bien establecida.',
        NOW() - INTERVAL '170 days'
    ),
    (
        gen_random_uuid(),
        demo_org_id,
        'Farmacia Especializada del Norte',
        NULL,
        'Blvd. Manuel Ávila Camacho 1234',
        'Tlalnepantla',
        'Estado de México',
        '55-5555-0000',
        'Q.F.B. Fernando Castro',
        'active',
        'Especializada en medicamentos controlados.',
        NOW() - INTERVAL '165 days'
    );
RAISE NOTICE '✓ Created 8 pharmacies';
-- NOTE: We cannot create visits yet because we don't have the demo_user_id
-- Visits will need to be created after the user first logs in
-- For now, we'll leave a comment about this limitation
RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✓ Demo seed completed successfully!';
RAISE NOTICE '';
RAISE NOTICE 'Created:';
RAISE NOTICE '  - 12 pharmaceutical products';
RAISE NOTICE '  - 5 health centers';
RAISE NOTICE '  - 15 doctor contacts';
RAISE NOTICE '  - 8 pharmacies';
RAISE NOTICE '';
RAISE NOTICE 'NOTE: Visits, inventory, and objectives will be created';
RAISE NOTICE 'automatically when the demo user first logs in.';
RAISE NOTICE '========================================';
END $$;