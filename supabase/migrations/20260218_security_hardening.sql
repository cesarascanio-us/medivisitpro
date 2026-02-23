-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MediVisitPro - Security Hardening (Supabase Advisor Fixes) - ULTIMATE
-- Purpose: Resolve remaining warnings for mutable search paths and permissive RLS policies.
-- Date: 2026-02-18
-- 1. Hardening Functions (MANDATORY SEARCH PATH)
-- -----------------------------------------------------------
-- Using a loop to find all functions and set search_path to public/pg_catalog 
-- to prevent potential search path attacks.
DO $$
DECLARE func_record RECORD;
BEGIN FOR func_record IN
SELECT n.nspname,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as args
FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND p.prosecdef = true -- Only SECURITY DEFINER functions
    LOOP EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_catalog, pg_temp',
        func_record.nspname,
        func_record.proname,
        func_record.args
    );
END LOOP;
END $$;
-- 2. Fixing SECURITY DEFINER Views
-- -----------------------------------------------------------
DO $$ BEGIN ALTER VIEW public.view_farmacia_stock_actual
SET (security_invoker = true);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN ALTER VIEW public.view_gerencial_kpis
SET (security_invoker = true);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN ALTER VIEW public.view_next_best_action
SET (security_invoker = true);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN ALTER VIEW public.view_warehouse_stock
SET (security_invoker = true);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN ALTER VIEW public.view_ventas_por_zona
SET (security_invoker = true);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN ALTER VIEW public.view_product_mix
SET (security_invoker = true);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
-- 3. Fixing "RLS Policy Always True" Tables
-- -----------------------------------------------------------
-- Specifically adding WITH CHECK clause for write operations as requested by Advisor.
CREATE OR REPLACE FUNCTION public.hard_apply_org_isolation(p_table_name TEXT) RETURNS VOID AS $$
DECLARE pol RECORD;
BEGIN -- Check if table exists and has organization_id
IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = p_table_name
        AND schemaname = 'public'
)
AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = p_table_name
        AND column_name = 'organization_id'
) THEN -- Enable RLS
EXECUTE format(
    'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
    p_table_name
);
-- DROP ALL existing policies to ensure no leakage
FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = p_table_name
    AND schemaname = 'public' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        pol.policyname,
        p_table_name
    );
END LOOP;
-- Create restrictive policy for ALL operations
-- Explicitly including WITH CHECK for write operations (INSERT/UPDATE)
EXECUTE format(
    'CREATE POLICY "Org Isolation Policy" ON public.%I 
                        FOR ALL 
                        USING (organization_id = get_my_organization_id() OR public.is_master()) 
                        WITH CHECK (organization_id = get_my_organization_id() OR public.is_master())',
    p_table_name
);
END IF;
END;
$$ LANGUAGE plpgsql;
-- Execute for all tables in the advisor's list
SELECT public.hard_apply_org_isolation('audit_logs');
SELECT public.hard_apply_org_isolation('companies');
SELECT public.hard_apply_org_isolation('contact_health_centers');
SELECT public.hard_apply_org_isolation('cycles');
SELECT public.hard_apply_org_isolation('daily_plan_details');
SELECT public.hard_apply_org_isolation('daily_plan_items');
SELECT public.hard_apply_org_isolation('doctor_schedules');
SELECT public.hard_apply_org_isolation('pharmacy_reports');
SELECT public.hard_apply_org_isolation('pharmacy_scores');
SELECT public.hard_apply_org_isolation('pop_assignments');
SELECT public.hard_apply_org_isolation('sample_requests');
SELECT public.hard_apply_org_isolation('subscriptions');
-- 4. Global Lookup Tables (Authenticated only)
-- -----------------------------------------------------------
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'specialties'
        AND schemaname = 'public'
) THEN DROP POLICY IF EXISTS "Allow authenticated read access for specialties" ON public.specialties;
CREATE POLICY "Authenticated Read Only" ON public.specialties FOR
SELECT TO authenticated USING (auth.uid() IS NOT NULL);
END IF;
END $$;
-- Clean up
DROP FUNCTION public.hard_apply_org_isolation(text);
-- 5. FINAL NOTICE: Auth Settings
-- -----------------------------------------------------------
-- The "Leaked Password Protection Disabled" warning MUST be fixed in the 
-- Supabase Dashboard under: Auth > Settings > Security > Leaked password protection.