-- SCRIPT DE SEEDING PARA DEMO DEDICADA (d33...)
-- Este script llena la organización "Demo Medical Corp" con datos ficticios
-- sin tocar la data real de "Laboratorio Alpha BTM".
DO $$
DECLARE demo_org_id UUID := 'd3300000-0000-0000-0000-000000000001';
demo_user_id UUID := '00000000-0000-0000-0000-000000000000';
-- ID genérico para demo
zone_norte_id UUID := gen_random_uuid();
zone_sur_id UUID := gen_random_uuid();
BEGIN RAISE NOTICE 'Iniciando carga de datos ficticios para Demo Medical Corp...';
-- 1. Limpiar datos existentes DE LA DEMO (para evitar duplicados)
-- NOTA: No toca datos de otras organizaciones
DELETE FROM doctors
WHERE organization_id = demo_org_id;
DELETE FROM pharmacies
WHERE organization_id = demo_org_id;
DELETE FROM contacts
WHERE organization_id = demo_org_id;
DELETE FROM zones
WHERE organization_id = demo_org_id;
DELETE FROM products
WHERE organization_id = demo_org_id;
-- 2. Crear Zonas Demo
INSERT INTO zones (id, name, organization_id)
VALUES (zone_norte_id, 'Zona Norte', demo_org_id),
    (zone_sur_id, 'Zona Sur', demo_org_id);
-- 3. Crear Productos Demo
INSERT INTO products (name, organization_id, type, stock)
VALUES (
        'CardioPlus 50mg',
        demo_org_id,
        'medicamento',
        1000
    ),
    (
        'NeuroFlex 20mg',
        demo_org_id,
        'medicamento',
        500
    ),
    (
        'GastroAlivio Jarabe',
        demo_org_id,
        'muestra',
        200
    );
-- 4. Crear Médicos Demo (20 registros variados)
INSERT INTO doctors (
        id,
        name,
        specialty,
        email,
        phone,
        address,
        organization_id,
        status,
        zone_id
    )
VALUES (
        gen_random_uuid(),
        'Dr. Roberto Gómez',
        'Cardiología',
        'rogomez@demo.com',
        '55-1234-5678',
        'Av. Reforma 222',
        demo_org_id,
        'active',
        zone_norte_id
    ),
    (
        gen_random_uuid(),
        'Dra. Ana Martínez',
        'Pediatría',
        'anamartinez@demo.com',
        '55-8765-4321',
        'Calle 10 #45',
        demo_org_id,
        'active',
        zone_sur_id
    ),
    (
        gen_random_uuid(),
        'Dr. Carlos Ruiz',
        'Medicina General',
        'cruiz@demo.com',
        '55-1111-2222',
        'Insurgentes Sur 100',
        demo_org_id,
        'active',
        zone_norte_id
    ),
    (
        gen_random_uuid(),
        'Dra. Laura Díaz',
        'Dermatología',
        'ldiaz@demo.com',
        '55-3333-4444',
        'Polanco V Secc',
        demo_org_id,
        'active',
        zone_sur_id
    ),
    (
        gen_random_uuid(),
        'Dr. Fernando Torres',
        'Gastroenterología',
        'ftorres@demo.com',
        '55-5555-6666',
        'Roma Norte',
        demo_org_id,
        'active',
        zone_norte_id
    ),
    (
        gen_random_uuid(),
        'Dra. Patricia Lima',
        'Ginecología',
        'plima@demo.com',
        '55-7777-8888',
        'Del Valle Centro',
        demo_org_id,
        'active',
        zone_sur_id
    ),
    (
        gen_random_uuid(),
        'Dr. Sergio Valles',
        'Neurología',
        'svalles@demo.com',
        '55-9999-0000',
        'Santa Fe Corp',
        demo_org_id,
        'active',
        zone_norte_id
    ),
    (
        gen_random_uuid(),
        'Dra. Mónica Solís',
        'Oftalmología',
        'msolis@demo.com',
        '55-2222-3333',
        'Coyoacán Centro',
        demo_org_id,
        'active',
        zone_sur_id
    ),
    (
        gen_random_uuid(),
        'Dr. Hugo Sánchez',
        'Traumatología',
        'hsanchez@demo.com',
        '55-4444-5555',
        'Tlalpan Sur',
        demo_org_id,
        'active',
        zone_norte_id
    ),
    (
        gen_random_uuid(),
        'Dra. Elena Cruz',
        'Psiquiatría',
        'ecruz@demo.com',
        '55-6666-7777',
        'Condesa',
        demo_org_id,
        'active',
        zone_sur_id
    );
-- Agregar 10 más para que se vea robusto
INSERT INTO doctors (id, name, specialty, organization_id, status)
SELECT gen_random_uuid(),
    'Medico Demo ' || i,
    'General',
    demo_org_id,
    'active'
FROM generate_series(11, 20) AS i;
-- 5. Crear Farmacias Demo
INSERT INTO pharmacies (name, address, organization_id, status)
VALUES (
        'Farmacia El Ahorro - Centro',
        'Centro Histórico',
        demo_org_id,
        'active'
    ),
    (
        'Farmacia San Pablo - Norte',
        'Lindavista',
        demo_org_id,
        'active'
    ),
    (
        'Farmacia Guadalajara - Sur',
        'Acoxpa',
        demo_org_id,
        'active'
    ),
    (
        'Farmacia Bienestar',
        'Narvarte',
        demo_org_id,
        'active'
    ),
    (
        'Farmacia La Salud',
        'Portales',
        demo_org_id,
        'active'
    );
RAISE NOTICE '¡Carga de datos Demo completada! El usuario Demo ahora verá 20 médicos y 5 farmacias.';
END $$;