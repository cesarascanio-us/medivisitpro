-- Robust Restore of Foreign Keys and Stubs

-- 1. Helper block to safely add constraints
DO $$ 
BEGIN
    -- CONTACTS FK
    BEGIN
        ALTER TABLE public.visits ADD CONSTRAINT visits_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not add visits_contact_id_fkey: %', SQLERRM;
    END;

    -- PHARMACIES FK
    BEGIN
        ALTER TABLE public.visits ADD CONSTRAINT visits_pharmacy_id_fkey FOREIGN KEY (pharmacy_id) REFERENCES public.pharmacies(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not add visits_pharmacy_id_fkey: %', SQLERRM;
    END;

    -- COMPANIES FK
    BEGIN
        ALTER TABLE public.visits ADD CONSTRAINT visits_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not add visits_company_id_fkey: %', SQLERRM;
    END;

    -- ZONES FK
    BEGIN
        ALTER TABLE public.visits ADD CONSTRAINT visits_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not add visits_zone_id_fkey: %', SQLERRM;
    END;
END $$;

-- 2. Create Stub Views (Drop first to ensure clean state)
DROP VIEW IF EXISTS public.view_next_best_action CASCADE;
CREATE OR REPLACE VIEW public.view_next_best_action AS
SELECT 
    v.id as visit_id,
    'schedule_followup'::text as action_type,
    'Schedule follow-up'::text as description,
    100 as score,
    v.user_id,
    v.contact_id
FROM public.visits v
LIMIT 0;

GRANT SELECT ON public.view_next_best_action TO authenticated;

DROP VIEW IF EXISTS public.view_opciones_abastecimiento CASCADE;
CREATE OR REPLACE VIEW public.view_opciones_abastecimiento AS
SELECT
    p.id as pharmacy_id,
    pr.id as product_id,
    'Available'::text as status,
    10 as quantity
FROM public.pharmacies p
CROSS JOIN public.products pr
LIMIT 0;

GRANT SELECT ON public.view_opciones_abastecimiento TO authenticated;
