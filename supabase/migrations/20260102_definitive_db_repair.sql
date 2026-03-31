-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- =====================================================
-- DATABASE REPAIR & POLICY WIPE - MediVisitPro
-- Date: 2026-01-02
-- Purpose: Dynamic wiping of ALL overlapping policies to fix "Database error querying schema"
-- =====================================================

-- 1. DYNAMIC WIPE (Elimina TODAS las políticas por nombre, sin importar cuántas hayamos creado)
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    -- Limpiar perfiles
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
    
    -- Limpiar roles
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;

    -- Limpiar roles (internal cache si existiera)
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles_plain' AND (schemaname = 'public' OR schemaname = 'auth_internal')) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Skipped some wipes, proceeding...';
END $$;

-- 2. DESACTIVAR RLS TEMPORALMENTE (Para asegurar acceso total mientras se refresca el cache)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3. REINICIAR TABLA DE CACHE (Ultra-simplificada)
DROP TABLE IF EXISTS public.user_roles_plain CASCADE;
DROP TABLE IF EXISTS auth_internal.user_roles_plain CASCADE;
DROP SCHEMA IF EXISTS auth_internal CASCADE;

CREATE TABLE public.user_roles_plain (
    user_id UUID PRIMARY KEY,
    role TEXT,
    organization_id UUID
);

-- Sincronizar gerente y maestros
INSERT INTO public.user_roles_plain (user_id, role, organization_id)
SELECT user_id, role, organization_id FROM public.user_roles;

-- 4. FUNCIONES DE SEGURIDAD ABSOLUTA (Sin recursión, sin esquemas extras)
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT SECURITY DEFINER AS $$
    SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_organization_id() RETURNS UUID SECURITY DEFINER AS $$
    SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 5. REHABILITAR SEGURIDAD DESDE CERO (Limpia y funcional)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Una sola política maestra por tabla (id::text para evitar cualquier error de tipo)
CREATE POLICY "Master Profile Access" ON public.profiles FOR ALL USING (
    user_id::text = auth.uid()::text OR 
    organization_id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
);

CREATE POLICY "Master User Roles Access" ON public.user_roles FOR ALL USING (
    user_id::text = auth.uid()::text OR 
    organization_id = (SELECT organization_id FROM public.user_roles_plain WHERE user_id = auth.uid())
);

-- 6. PERMISOS TOTALES PARA ROLES DE SISTEMA
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, authenticator;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, authenticator;

-- 7. REFRESCAR CACHE (Vital para corregir "Database error querying schema")
NOTIFY pgrst, 'reload schema';
