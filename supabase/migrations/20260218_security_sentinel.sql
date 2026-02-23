-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- MediVisitPro - Security Policy Sentinel
-- Purpose: Monitor if critical RLS policies are missing or modified
-- 1. Table to store security alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,
    -- 'rls_missing', 'master_function_missing', 'bad_policy_config'
    table_name TEXT,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'high',
    -- 'info', 'medium', 'high', 'critical'
    is_resolved BOOLEAN DEFAULT false,
    ai_safe_check BOOLEAN DEFAULT true,
    -- Flag to indicate this was a system-generated alert
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
-- Enable RLS on alerts
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Master can view alerts" ON public.security_alerts FOR ALL USING (public.is_master());
-- 2. Function to scan for policy integrity
CREATE OR REPLACE FUNCTION public.check_security_integrity() RETURNS JSONB AS $$
DECLARE missing_policies TEXT [] := ARRAY []::TEXT [];
alert_count INTEGER := 0;
critical_tables TEXT [] := ARRAY ['organizations', 'user_roles', 'profiles', 'visits', 'contacts', 'products'];
t TEXT;
policy_exists BOOLEAN;
BEGIN -- Check for each critical table if it has at least one policy
FOREACH t IN ARRAY critical_tables LOOP
SELECT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
            AND tablename = t
    ) INTO policy_exists;
IF NOT policy_exists THEN missing_policies := array_append(missing_policies, t);
-- Insert alert if not already logged and unresolved
IF NOT EXISTS (
    SELECT 1
    FROM public.security_alerts
    WHERE table_name = t
        AND alert_type = 'rls_missing'
        AND is_resolved = false
) THEN
INSERT INTO public.security_alerts (alert_type, table_name, description, severity)
VALUES (
        'rls_missing',
        t,
        'CRITICAL: RLS Policies for table ' || t || ' appear to be missing or disabled.',
        'critical'
    );
alert_count := alert_count + 1;
END IF;
END IF;
END LOOP;
-- Check if is_master() function exists
IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
        JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
    WHERE n.nspname = 'public'
        AND proname = 'is_master'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM public.security_alerts
    WHERE alert_type = 'master_function_missing'
        AND is_resolved = false
) THEN
INSERT INTO public.security_alerts (alert_type, description, severity)
VALUES (
        'master_function_missing',
        'CRITICAL: public.is_master() function is MISSING. Master access is broken.',
        'critical'
    );
alert_count := alert_count + 1;
END IF;
END IF;
RETURN jsonb_build_object(
    'status',
    CASE
        WHEN array_length(missing_policies, 1) > 0 THEN 'compromised'
        ELSE 'secure'
    END,
    'missing_tables',
    missing_policies,
    'new_alerts_created',
    alert_count
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. Initial scan
SELECT public.check_security_integrity();