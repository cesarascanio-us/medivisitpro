-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- FIX SECURITY ADVISOR WARNINGS (CORRECTED V2)
-- 1. Fix "Function Search Path Mutable"
-- (These are safe to re-run)
ALTER FUNCTION public.populate_demo_user_data
SET search_path = public;
ALTER FUNCTION public.handle_user_first_login
SET search_path = public;
ALTER FUNCTION public.seed_demo_data
SET search_path = public;
ALTER FUNCTION public.register_visit_sample_drop
SET search_path = public;
ALTER FUNCTION public.register_visit_pop_drop
SET search_path = public;
ALTER FUNCTION public.sync_user_roles_plain
SET search_path = public;
-- 2. Fix "RLS Policy Always True" (Locking down Reference Tables with JOINS)
-- ========================================================
-- Audit Logs
-- ========================================================
DROP POLICY IF EXISTS "audit_insert_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_read_policy" ON public.audit_logs;
CREATE POLICY "audit_insert_policy" ON public.audit_logs FOR
INSERT TO authenticated WITH CHECK (true);
-- Anyone can log
CREATE POLICY "audit_read_policy" ON public.audit_logs FOR
SELECT TO authenticated USING (
        (
            SELECT role
            FROM public.user_roles
            WHERE user_id = auth.uid()
            LIMIT 1
        ) IN ('admin', 'manager', 'master')
        AND organization_id = (
            SELECT organization_id
            FROM public.profiles
            WHERE id = auth.uid()
        )
    );
-- ========================================================
-- Assignment Items (Linked to sample_assignments)
-- ========================================================
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.assignment_items;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.assignment_items;
DROP POLICY IF EXISTS "View Own or Org Assignments" ON public.assignment_items;
DROP POLICY IF EXISTS "Manage Org Assignments" ON public.assignment_items;
CREATE POLICY "View Linked Assignments" ON public.assignment_items FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.sample_assignments sa
            WHERE sa.id = assignment_items.assignment_id
                AND (
                    sa.representative_id = auth.uid()
                    OR sa.created_by = auth.uid()
                    OR sa.organization_id = (
                        SELECT organization_id
                        FROM public.profiles
                        WHERE id = auth.uid()
                    )
                )
        )
    );
CREATE POLICY "Manage Linked Assignments" ON public.assignment_items FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.sample_assignments sa
        WHERE sa.id = assignment_items.assignment_id
            AND sa.organization_id = (
                SELECT organization_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
            AND (
                SELECT role
                FROM public.user_roles
                WHERE user_id = auth.uid()
                LIMIT 1
            ) IN ('admin', 'manager', 'master', 'supervisor')
    )
);
-- ========================================================
-- Bank Inventory (Linked to sample_banks)
-- ========================================================
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.bank_inventory;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.bank_inventory;
DROP POLICY IF EXISTS "View Org Bank Inventory" ON public.bank_inventory;
DROP POLICY IF EXISTS "Manage Org Bank Inventory" ON public.bank_inventory;
CREATE POLICY "View Linked Bank Inventory" ON public.bank_inventory FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.sample_banks sb
                JOIN public.profiles p ON sb.responsible_user_id = p.id
            WHERE sb.id = bank_inventory.bank_id
                AND (
                    sb.responsible_user_id = auth.uid()
                    OR p.organization_id = (
                        SELECT organization_id
                        FROM public.profiles
                        WHERE id = auth.uid()
                    )
                )
        )
    );
CREATE POLICY "Manage Linked Bank Inventory" ON public.bank_inventory FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.sample_banks sb
            JOIN public.profiles p ON sb.responsible_user_id = p.id
        WHERE sb.id = bank_inventory.bank_id
            AND p.organization_id = (
                SELECT organization_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
            AND (
                SELECT role
                FROM public.user_roles
                WHERE user_id = auth.uid()
                LIMIT 1
            ) IN ('admin', 'manager', 'master', 'supervisor')
    )
);
-- ========================================================
-- Commercial Offers (Linked to products)
-- ========================================================
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.commercial_offers;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.commercial_offers;
DROP POLICY IF EXISTS "View Org Commercial Offers" ON public.commercial_offers;
DROP POLICY IF EXISTS "Manage Org Commercial Offers" ON public.commercial_offers;
CREATE POLICY "View Linked Offers" ON public.commercial_offers FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = commercial_offers.product_id
                AND (
                    p.organization_id = (
                        SELECT organization_id
                        FROM public.profiles
                        WHERE id = auth.uid()
                    )
                    OR p.organization_id IS NULL
                )
        )
    );
CREATE POLICY "Manage Linked Offers" ON public.commercial_offers FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.products p
        WHERE p.id = commercial_offers.product_id
            AND p.organization_id = (
                SELECT organization_id
                FROM public.profiles
                WHERE id = auth.uid()
            )
            AND (
                SELECT role
                FROM public.user_roles
                WHERE user_id = auth.uid()
                LIMIT 1
            ) IN ('admin', 'manager', 'master')
    )
);