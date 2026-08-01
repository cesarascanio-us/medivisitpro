-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- UNIFIED DEMO SEED SCRIPT (2026) - FIXED VERSION
-- Targets the official Demo Account
-- Org: d3300000-0000-0000-0000-000000000001
-- User: 0a1b967a-d394-4b2d-9fae-eac81df42e65 (demo.medivisitpro@gmail.com)
DO $$
DECLARE v_org_id UUID := 'd3300000-0000-0000-0000-000000000001';
v_user_id UUID := '0a1b967a-d394-4b2d-9fae-eac81df42e65';
v_email TEXT := 'demo.medivisitpro@gmail.com';
v_zone_id UUID := 'a3300000-0000-0000-0000-000000000001';
-- Entity IDs (HEX ONLY)
v_doc_id UUID := 'd0000000-0000-0000-0000-000000000001';
v_pharm_id UUID := 'f0000000-0000-0000-0000-000000000001';
v_hc_id UUID := 'b0000000-0000-0000-0000-000000000001';
-- Item IDs (HEX ONLY)
v_item_doc_id UUID := 'e0000000-0000-0000-0000-000000000001';
v_item_pharm_id UUID := 'e0000000-0000-0000-0000-000000000002';
v_item_hc_id UUID := 'e0000000-0000-0000-0000-000000000003';
BEGIN -- 1. Ensure Organization
INSERT INTO organizations (id, name, slug)
VALUES (
        v_org_id,
        'Demo Medical Solutions',
        'demo-medical'
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug;
-- 2. Ensure Profile
INSERT INTO profiles (
        id,
        user_id,
        first_name,
        last_name,
        email,
        organization_id
    )
VALUES (
        v_user_id,
        v_user_id,
        'Usuario',
        'Demo',
        v_email,
        v_org_id
    ) ON CONFLICT (user_id) DO
UPDATE
SET organization_id = EXCLUDED.organization_id;
-- 3. Ensure Zone
INSERT INTO zones (id, name, organization_id)
VALUES (v_zone_id, 'Zona Demo Central', v_org_id) ON CONFLICT (id) DO NOTHING;
-- 4. Create Entities (Ensuring all NOT NULL columns are present)
-- Doctor
INSERT INTO doctors (
        id,
        user_id,
        name,
        specialty,
        organization_id,
        representative_id,
        zone_id,
        address,
        city,
        state,
        status
    )
VALUES (
        v_doc_id,
        v_user_id,
        'Dr. Alberto Rivera',
        'Cardiología',
        v_org_id,
        v_user_id,
        v_zone_id,
        'Av. Libertador 123',
        'Caracas',
        'Miranda',
        'Activo'
    ) ON CONFLICT (id) DO NOTHING;
-- Pharmacy
INSERT INTO pharmacies (
        id,
        user_id,
        name,
        organization_id,
        representative_id,
        zone_id,
        address,
        city,
        state,
        status
    )
VALUES (
        v_pharm_id,
        v_user_id,
        'FarmaBien Sede Central',
        v_org_id,
        v_user_id,
        v_zone_id,
        'Av. Intercomunal',
        'Caracas',
        'Distrito Capital',
        'Activo'
    ) ON CONFLICT (id) DO NOTHING;
-- Health Center
INSERT INTO health_centers (
        id,
        user_id,
        name,
        facility_type,
        organization_id,
        zone_id,
        city,
        state
    )
VALUES (
        v_hc_id,
        v_user_id,
        'Centro Médico Caracas',
        'clínica',
        v_org_id,
        v_zone_id::text,
        'Caracas',
        'Distrito Capital'
    ) ON CONFLICT (id) DO NOTHING;
-- 5. Create Directory Items (Polymorphic Link)
INSERT INTO directory_items (
        id,
        entity_id,
        entity_type,
        name,
        address,
        city,
        zone_id
    )
VALUES (
        v_item_doc_id,
        v_doc_id,
        'doctor',
        'Dr. Alberto Rivera',
        'Av. Libertador 123',
        'Caracas',
        v_zone_id
    ),
    (
        v_item_pharm_id,
        v_pharm_id,
        'pharmacy',
        'FarmaBien Sede Central',
        'Av. Intercomunal',
        'Caracas',
        v_zone_id
    ),
    (
        v_item_hc_id,
        v_hc_id,
        'health_center',
        'Centro Médico Caracas',
        'Av. Panteón',
        'Caracas',
        v_zone_id
    ) ON CONFLICT (id) DO NOTHING;
-- 6. Create Mirror Contacts (UI Dependency)
INSERT INTO contacts (
        id,
        name,
        specialty,
        contact_type,
        organization_id,
        user_id,
        zone_id,
        address,
        city
    )
VALUES (
        v_doc_id,
        'Dr. Alberto Rivera',
        'Cardiología',
        'doctor',
        v_org_id,
        v_user_id,
        v_zone_id,
        'Av. Libertador 123',
        'Caracas'
    ),
    (
        v_pharm_id,
        'FarmaBien Sede Central',
        'Farmacia',
        'pharmacy',
        v_org_id,
        v_user_id,
        v_zone_id,
        'Av. Intercomunal',
        'Caracas'
    ),
    (
        v_hc_id,
        'Centro Médico Caracas',
        'Hospital/Clínica',
        'hospital',
        v_org_id,
        v_user_id,
        v_zone_id,
        'Av. Panteón',
        'Caracas'
    ) ON CONFLICT (id) DO NOTHING;
-- 7. Seed Visits (Trigger will update stats)
INSERT INTO visits (
        user_id,
        organization_id,
        contact_id,
        directory_item_id,
        scheduled_date,
        status,
        visit_type,
        objective
    )
VALUES (
        v_user_id,
        v_org_id,
        v_doc_id,
        v_item_doc_id,
        now() - interval '1 day',
        'completed',
        'doctor',
        'Presentación de portafolio cardiovascular'
    );
INSERT INTO visits (
        user_id,
        organization_id,
        contact_id,
        directory_item_id,
        scheduled_date,
        status,
        visit_type,
        objective
    )
VALUES (
        v_user_id,
        v_org_id,
        v_pharm_id,
        v_item_pharm_id,
        now() - interval '2 days',
        'completed',
        'pharmacy',
        'Levantamiento de inventario'
    );
INSERT INTO visits (
        user_id,
        organization_id,
        contact_id,
        directory_item_id,
        scheduled_date,
        status,
        visit_type,
        objective
    )
VALUES (
        v_user_id,
        v_org_id,
        v_hc_id,
        v_item_hc_id,
        now() + interval '1 day',
        'scheduled',
        'doctor',
        'Visita institucional'
    );
RAISE NOTICE 'Demo data seeded successfully.';
END $$;