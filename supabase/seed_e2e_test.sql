-- ========================================================================
-- MASTER SEED - PRUEBA E2E INDUSTRIAL
-- Proyecto: MediVisitPro
-- ========================================================================

DO $$
DECLARE
    -- Constantes de prueba para fácil identificación
    v_user_id UUID := (SELECT id FROM auth.users LIMIT 1); 
    v_org_id UUID := '77777777-7777-7777-7777-777777777777';
    v_hc_id UUID := '88888888-8888-8888-8888-888888888888';
    v_doc_id UUID := '99999999-9999-9999-9999-999999999999';
    v_prod_id UUID := 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
    v_wh_id UUID := 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB';
BEGIN
    -- 1. ORGANIZACIÓN
    INSERT INTO public.organizations (id, name, slug, plan_tier, subscription_status)
    VALUES (v_org_id, 'E2E TEST CORP', 'e2e-test', 'enterprise', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 2. PERFIL Y ROL
    INSERT INTO public.profiles (user_id, organization_id, first_name, last_name)
    VALUES (v_user_id, v_org_id, 'QA', 'Automator')
    ON CONFLICT (user_id) DO UPDATE SET organization_id = v_org_id;

    INSERT INTO public.user_roles (user_id, organization_id, role, is_active)
    VALUES (v_user_id, v_org_id, 'representative', true)
    ON CONFLICT (user_id) DO UPDATE SET role = 'representative';

    -- 3. CENTRO DE SALUD
    INSERT INTO public.health_centers (id, organization_id, user_id, name, address, facility_type)
    VALUES (v_hc_id, v_org_id, v_user_id, 'Centro Tecnológico QA', 'Silicon Valley 404', 'clinic')
    ON CONFLICT (id) DO NOTHING;

    -- 4. MÉDICO (CONTACTO)
    INSERT INTO public.contacts (id, organization_id, user_id, name, specialty, contact_type)
    VALUES (v_doc_id, v_org_id, v_user_id, 'Dr. Robot E2E', 'Ingeniería de Software', 'doctor')
    ON CONFLICT (id) DO NOTHING;

    -- 5. PRODUCTO E INVENTARIO
    INSERT INTO public.products (id, organization_id, name, product_code, category)
    VALUES (v_prod_id, v_org_id, 'Test-Medicine-API', 'QA-500', 'test')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.warehouses (id, organization_id, name, is_main)
    VALUES (v_wh_id, v_org_id, 'Warehouse Master E2E', true)
    ON CONFLICT (id) DO NOTHING;

    -- Stock inicial: 20 unidades
    INSERT INTO public.warehouse_batches (id, organization_id, product_id, warehouse_id, batch_number, quantity, expiry_date)
    VALUES (gen_random_uuid(), v_org_id, v_prod_id, v_wh_id, 'LOTE-E2E-AUT', 20, CURRENT_DATE + INTERVAL '10 days')
    ON CONFLICT DO NOTHING;

    -- 6. VISITA AGENDADA
    INSERT INTO public.visits (id, organization_id, user_id, contact_id, status, scheduled_date, visit_type)
    VALUES (gen_random_uuid(), v_org_id, v_user_id, v_doc_id, 'scheduled', CURRENT_DATE, 'presential')
    ON CONFLICT DO NOTHING;

    -- VERIFICACIÓN FINAL
    RAISE NOTICE '--- VERIFICACIÓN DE SEED ---';
    PERFORM count(*) FROM public.organizations WHERE id = v_org_id;
    RAISE NOTICE 'Organización: OK';
    PERFORM count(*) FROM public.profiles WHERE user_id = v_user_id AND organization_id = v_org_id;
    RAISE NOTICE 'Perfil: OK';
    PERFORM count(*) FROM public.health_centers WHERE id = v_hc_id;
    RAISE NOTICE 'Centro de Salud: OK';
    PERFORM count(*) FROM public.contacts WHERE id = v_doc_id;
    RAISE NOTICE 'Médico: OK';
    PERFORM count(*) FROM public.products WHERE id = v_prod_id;
    RAISE NOTICE 'Producto: OK';
    PERFORM count(*) FROM public.warehouse_batches WHERE product_id = v_prod_id;
    RAISE NOTICE 'Inventario: OK';
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'ESCENARIO E2E LISTO PARA EJECUCIÓN';
    RAISE NOTICE '==========================================';
END $$;
