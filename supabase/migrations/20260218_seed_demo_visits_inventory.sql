-- ==============================================================================
-- SEMILLA DE DATOS COMPLEMENTARIA: VISITAS E INVENTARIO (DEMO 2026)
-- ==============================================================================
-- Fecha: 18/02/2026
-- Dependencia: Requiere haber corrido `20260218_seed_active_demo_data.sql`
-- Propósito: Llenar las tablas críticas para el Dashboard: Visits, RepInventory, Objectives
-- ==============================================================================
DO $$
DECLARE -- IDs Oficiales del Entorno Demo
    v_org_id UUID := 'd3300000-0000-0000-0000-000000000001';
v_user_id UUID := '0a1b967a-d394-4b2d-9fae-eac81df42e65';
v_email TEXT := 'demo.medivisitpro@gmail.com';
-- IDs de Contactos (Cargados en el script principal)
v_doc_id UUID := 'd0000000-0000-0000-0000-000000000001';
v_pharm_id UUID := 'f0000000-0000-0000-0000-000000000001';
v_hc_id UUID := 'b0000000-0000-0000-0000-000000000001';
-- IDs de Productos (Nuevos)
v_prod_atorva_id UUID := 'f0000000-0000-0000-0000-000000000010';
v_prod_omeprazol_id UUID := 'f0000000-0000-0000-0000-000000000011';
v_prod_losartan_id UUID := 'f0000000-0000-0000-0000-000000000012';
v_prod_neuro_id UUID := 'f0000000-0000-0000-0000-000000000013';
BEGIN RAISE NOTICE 'Sembrando Visitas e Inventario para User: % en Org: %',
v_user_id,
v_org_id;
-- 1. LIMPIEZA DE DATOS PREVIOS
DELETE FROM rep_inventory
WHERE user_id = v_user_id;
DELETE FROM objectives
WHERE user_id = v_user_id;
DELETE FROM visits
WHERE user_id = v_user_id;
-- 2. INSERTAR PRODUCTOS
INSERT INTO products (
        id,
        name,
        description,
        category,
        therapeutic_area,
        dosage,
        presentation,
        price,
        organization_id,
        created_at
    )
VALUES (
        v_prod_atorva_id,
        'Atorvastatina 20mg',
        'Control de colesterol',
        'Cardiovascular',
        'Cardiología',
        '20mg',
        'Caja x 30',
        25.50,
        v_org_id,
        now()
    ),
    (
        v_prod_omeprazol_id,
        'Omeprazol 20mg',
        'Protector gástrico',
        'Gastrointestinal',
        'Gastroenterología',
        '20mg',
        'Caja x 14',
        15.00,
        v_org_id,
        now()
    ),
    (
        v_prod_losartan_id,
        'Losartán 50mg',
        'Antihipertensivo',
        'Cardiovascular',
        'Cardiología',
        '50mg',
        'Caja x 30',
        22.00,
        v_org_id,
        now()
    ),
    (
        v_prod_neuro_id,
        'NeuroFortis Plus',
        'Neuroprotector Premium',
        'Lanzamiento',
        'Neurología',
        '5mg/ml',
        'Frasco 120ml',
        45.00,
        v_org_id,
        now()
    ) ON CONFLICT (name, organization_id) DO
UPDATE
SET id = EXCLUDED.id,
    description = EXCLUDED.description,
    price = EXCLUDED.price;
-- 3. INSERTAR INVENTARIO
INSERT INTO rep_inventory (user_id, product_id, quantity)
VALUES (v_user_id, v_prod_atorva_id, 50),
    (v_user_id, v_prod_omeprazol_id, 35),
    (v_user_id, v_prod_losartan_id, 45),
    (v_user_id, v_prod_neuro_id, 120) ON CONFLICT (user_id, product_id) DO
UPDATE
SET quantity = EXCLUDED.quantity;
-- 4. INSERTAR OBJETIVOS (Dashboard KPIs)
-- Quitamos ON CONFLICT porque la tabla no tiene una restricción única por (user_id, organization_id, title)
-- Confiamos en el DELETE inicial.
INSERT INTO objectives (
        user_id,
        organization_id,
        title,
        objective_type,
        category,
        target_value,
        current_value,
        start_date,
        end_date,
        status
    )
VALUES (
        v_user_id,
        v_org_id,
        'Visitas Mensuales',
        'monthly',
        'visits',
        60,
        42,
        date_trunc('month', current_date),
        (
            date_trunc('month', current_date) + interval '1 month - 1 day'
        )::date,
        'active'
    ),
    (
        v_user_id,
        v_org_id,
        'Cobertura Territorial',
        'monthly',
        'coverage',
        90,
        75,
        date_trunc('month', current_date),
        (
            date_trunc('month', current_date) + interval '1 month - 1 day'
        )::date,
        'active'
    ),
    (
        v_user_id,
        v_org_id,
        'Colocación NeuroFortis',
        'monthly',
        'sales',
        100,
        25,
        date_trunc('month', current_date),
        (
            date_trunc('month', current_date) + interval '1 month - 1 day'
        )::date,
        'active'
    );
-- 5. INSERTAR VISITAS 
INSERT INTO visits (
        user_id,
        organization_id,
        contact_id,
        scheduled_date,
        status,
        visit_type,
        objective,
        notes,
        actual_start_time,
        actual_end_time
    )
VALUES (
        v_user_id,
        v_org_id,
        v_doc_id,
        (now() - interval '2 days'),
        'completed',
        'doctor',
        'Presentación NeuroFortis Pediátrico',
        'Interés en dosificación infantil.',
        (
            now() - interval '2 days' - interval '30 minutes'
        ),
        (now() - interval '2 days')
    );
INSERT INTO visits (
        user_id,
        organization_id,
        contact_id,
        scheduled_date,
        status,
        visit_type,
        objective,
        notes
    )
VALUES (
        v_user_id,
        v_org_id,
        v_pharm_id,
        (now() - interval '1 day'),
        'completed',
        'pharmacy',
        'Revisión de Stock Losartán',
        'Falta material POP.'
    );
INSERT INTO visits (
        user_id,
        organization_id,
        contact_id,
        scheduled_date,
        status,
        visit_type,
        objective,
        notes
    )
VALUES (
        v_user_id,
        v_org_id,
        v_hc_id,
        (now() + interval '1 day'),
        'scheduled',
        'doctor',
        'Visita institucional',
        'Hablar con dirección médica.'
    );
RAISE NOTICE 'Carga de Visitas e Inventario completada.';
END $$;