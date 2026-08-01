-- ========================================================================
-- MASTER INDUSTRIALIZATION SCHEMA - MEDIVISITPRO (SaaS Reinforcement)
-- Date: 2024-03-31
-- Author: CA Industrial Agent
-- ========================================================================

-- 1. SECURITY: Master System Config
CREATE TABLE IF NOT EXISTS public.master_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Ensure columns exist (if table was created previously without them)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='master_users' AND column_name='notes') THEN
        ALTER TABLE public.master_users ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='master_users' AND column_name='is_active') THEN
        ALTER TABLE public.master_users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- RLS for master_users (Super Secure)
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "System only read master_users" ON public.master_users;
CREATE POLICY "System only read master_users" ON public.master_users
    FOR SELECT TO authenticated
    USING (false); -- Prevent direct frontend reading (use RPC instead)

-- 2. RPC: System Master Resolution
DROP FUNCTION IF EXISTS public.is_system_master();
CREATE OR REPLACE FUNCTION public.is_system_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.master_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FEFO ENGINE: Proactive Inventory Scanning
DROP FUNCTION IF EXISTS public.run_fefo_inventory_scan();
CREATE OR REPLACE FUNCTION public.run_fefo_inventory_scan()
RETURNS JSON AS $$
DECLARE
    scan_results JSON;
    count_notified INTEGER := 0;
BEGIN
    -- 1. Find batches expiring in <= 30 days that haven't been notified yet (or we just notify anyway for demo)
    -- We assume the 'notifications' table exists or we create a simplified version if not
    
    INSERT INTO public.notifications (
        organization_id, 
        user_id, 
        title, 
        message, 
        type, 
        source_id,
        source_table
    )
    SELECT 
        organization_id,
        user_id,
        '🚨 Alerta FEFO: Expiración Próxima',
        'El lote ' || batch_number || ' del producto ' || (SELECT name FROM products WHERE id = product_id) || ' vence el ' || TO_CHAR(expiry_date, 'DD/MM/YYYY'),
        'inventory_alert',
        id,
        'warehouse_batches'
    FROM 
        public.warehouse_batches
    WHERE 
        expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        AND organization_id IS NOT NULL;

    GET DIAGNOSTICS count_notified = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'notified_count', count_notified,
        'scan_timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS REINFORCEMENT (SaaS Isolation Audit)
-- We use a DO block to safely apply RLS to existing tables

DO $$ 
BEGIN
    -- Table: directory_items (Universal but scope-aware if possible)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'directory_items') THEN
        ALTER TABLE public.directory_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.directory_items;
        DROP POLICY IF EXISTS "Enable all access for admin/master" ON public.directory_items;
        DROP POLICY IF EXISTS "Universal Read Directory" ON public.directory_items;
        DROP POLICY IF EXISTS "Master Write Directory" ON public.directory_items;
        
        CREATE POLICY "Universal Read Directory" ON public.directory_items 
            FOR SELECT TO authenticated USING (true);
        
        CREATE POLICY "Master Write Directory" ON public.directory_items 
            FOR ALL TO authenticated USING (public.is_system_master());
    END IF;

    -- Table: contacts (Critical Multitenant)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts') THEN
        ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org Contact Access" ON public.contacts;
        DROP POLICY IF EXISTS "Org Contact Isolation" ON public.contacts;
        CREATE POLICY "Org Contact Isolation" ON public.contacts
            FOR ALL TO authenticated
            USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;

    -- Table: visits (Critical Multitenant)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visits') THEN
        ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org Visit Access" ON public.visits;
        DROP POLICY IF EXISTS "Org Visit Isolation" ON public.visits;
        CREATE POLICY "Org Visit Isolation" ON public.visits
            FOR ALL TO authenticated
            USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;

    -- Table: products (Global vs Org)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org Product Access" ON public.products;
        DROP POLICY IF EXISTS "Org Product Isolation" ON public.products;
        CREATE POLICY "Org Product Isolation" ON public.products
            FOR SELECT TO authenticated
            USING (organization_id IS NULL OR organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;

    -- Table: health_centers (Existing Table Check)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'health_centers') THEN
        ALTER TABLE public.health_centers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org Health Center Access" ON public.health_centers;
        DROP POLICY IF EXISTS "Org Health Center Isolation" ON public.health_centers;
        CREATE POLICY "Org Health Center Isolation" ON public.health_centers
            FOR ALL TO authenticated
            USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;

    -- Table: warehouses (Existing Table Check)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'warehouses') THEN
        ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org Warehouse Access" ON public.warehouses;
        DROP POLICY IF EXISTS "Org Warehouse Isolation" ON public.warehouses;
        CREATE POLICY "Org Warehouse Isolation" ON public.warehouses
            FOR ALL TO authenticated
            USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;

    -- Table: notifications (Existing Table Check)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "User Notification Access" ON public.notifications;
        DROP POLICY IF EXISTS "User Notification Isolation" ON public.notifications;
        CREATE POLICY "User Notification Isolation" ON public.notifications
            FOR ALL TO authenticated
            USING (user_id = auth.uid() OR organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;

END $$;

-- 5. SEED MASTER DATA (Industrial Requirement)
-- Insert current master email for immediate resolution
INSERT INTO public.master_users (email, notes)
VALUES ('cesar.ascanio@gmail.com', 'System Owner Industrial Root')
ON CONFLICT (email) DO NOTHING;
