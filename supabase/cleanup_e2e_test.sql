-- ========================================================================
-- MASTER CLEANUP - PRUEBA E2E INDUSTRIAL
-- Proyecto: MediVisitPro
-- ========================================================================

DO $$
DECLARE
    -- Constantes de prueba para fácil identificación
    v_org_id UUID := '77777777-7777-7777-7777-777777777777';
    v_hc_id UUID := '88888888-8888-8888-8888-888888888888';
    v_doc_id UUID := '99999999-9999-9999-9999-999999999999';
    v_prod_id UUID := 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
    v_wh_id UUID := 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB';
BEGIN
    -- 1. LIMPIEZA DE VISITAS Y REGISTROS
    DELETE FROM public.visits WHERE organization_id = v_org_id;
    DELETE FROM public.registro_pvp_farmacia WHERE pharmacy_id IN (SELECT id FROM public.pharmacies WHERE organization_id = v_org_id);
    DELETE FROM public.warehouse_batches WHERE organization_id = v_org_id;
    DELETE FROM public.warehouse_movements WHERE organization_id = v_org_id;
    DELETE FROM public.warehouses WHERE id = v_wh_id;
    DELETE FROM public.products WHERE id = v_prod_id;
    DELETE FROM public.contacts WHERE id = v_doc_id;
    DELETE FROM public.health_centers WHERE id = v_hc_id;
    DELETE FROM public.user_roles WHERE organization_id = v_org_id;
    DELETE FROM public.profiles WHERE organization_id = v_org_id;
    DELETE FROM public.organizations WHERE id = v_org_id;

    RAISE NOTICE '--- LIMPIEZA DE E2E ---';
    RAISE NOTICE 'Todos los registros de prueba eliminados correctamente.';
    RAISE NOTICE '==========================================';
END $$;
