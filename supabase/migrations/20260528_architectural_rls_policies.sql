-- ========================================================================
-- MIGRATION: Architectural RLS and Hierarchies (The 4 Groups)
-- ========================================================================

-- 1. ADD HIERARCHY AND EXTERNAL LINKING COLUMNS
-- Añadimos manager_id para soportar jerarquías reales en SQL (Mejor que Email_Jefe)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Añadimos external_auth_id a contacts para los usuarios B2B (Médicos y Farmacias)
-- Esto permite que un contacto en el fichero pueda "iniciar sesión" y ver su data.
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS external_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;


-- 2. CREATE HELPER SECURITY FUNCTIONS (SECURITY DEFINER to bypass RLS internally)
-- Función para determinar si el usuario es Master o Admin (Grupo 1)
CREATE OR REPLACE FUNCTION public.auth_has_global_access()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
    RETURN user_role IN ('master', 'admin');
END;
$$;

-- Función para determinar si el usuario actual es Jefe/Gerente/Supervisor de alguien (Grupo 2)
CREATE OR REPLACE FUNCTION public.auth_is_manager_of(employee_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    is_manager BOOLEAN;
BEGIN
    -- Verificamos si en el perfil del empleado, su manager_id coincide con el uid() logueado.
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = employee_uuid 
        AND manager_id = auth.uid()
    ) INTO is_manager;
    RETURN is_manager;
END;
$$;


-- 3. DROP OLD RESTRICTIVE POLICIES
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Contacts
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

-- Visits
DROP POLICY IF EXISTS "Users can view their own visits" ON public.visits;
DROP POLICY IF EXISTS "Users can create their own visits" ON public.visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON public.visits;

-- Samples
DROP POLICY IF EXISTS "Users can view their own samples" ON public.samples;
DROP POLICY IF EXISTS "Users can create their own samples" ON public.samples;
DROP POLICY IF EXISTS "Users can update their own samples" ON public.samples;


-- 4. CREATE NEW ARCHITECTURAL POLICIES (Los 4 Grupos)

-- =========================================================
-- PROFILES POLICIES
-- =========================================================
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
USING (
    user_id = auth.uid() -- Propio (Grupo 3 y todos)
    OR public.auth_has_global_access() -- Master/Admin (Grupo 1)
    OR public.auth_is_manager_of(user_id) -- Jefe/Supervisor (Grupo 2)
);

CREATE POLICY "profiles_modify_policy" ON public.profiles FOR ALL
USING (
    user_id = auth.uid() 
    OR public.auth_has_global_access()
);

-- =========================================================
-- CONTACTS POLICIES
-- =========================================================
CREATE POLICY "contacts_select_policy" ON public.contacts FOR SELECT
USING (
    user_id = auth.uid() -- El rep que lo creó (Grupo 3)
    OR external_auth_id = auth.uid() -- El propio médico/farmacia logueado (Grupo 4)
    OR public.auth_has_global_access() -- Master/Admin (Grupo 1)
    OR public.auth_is_manager_of(user_id) -- Supervisor del rep (Grupo 2)
);

CREATE POLICY "contacts_modify_policy" ON public.contacts FOR ALL
USING (
    user_id = auth.uid() 
    OR public.auth_has_global_access()
    OR public.auth_is_manager_of(user_id)
);

-- =========================================================
-- VISITS POLICIES
-- =========================================================
CREATE POLICY "visits_select_policy" ON public.visits FOR SELECT
USING (
    user_id = auth.uid() -- El rep que hace la visita (Grupo 3)
    OR public.auth_has_global_access() -- Master/Admin (Grupo 1)
    OR public.auth_is_manager_of(user_id) -- Supervisor del rep (Grupo 2)
    OR EXISTS ( -- El B2B (Médico) viendo sus propias visitas recibidas (Grupo 4)
        SELECT 1 FROM public.contacts 
        WHERE contacts.id = visits.contact_id 
        AND contacts.external_auth_id = auth.uid()
    )
);

CREATE POLICY "visits_modify_policy" ON public.visits FOR ALL
USING (
    user_id = auth.uid() 
    OR public.auth_has_global_access()
    OR public.auth_is_manager_of(user_id)
);

-- =========================================================
-- SAMPLES POLICIES
-- =========================================================
CREATE POLICY "samples_select_policy" ON public.samples FOR SELECT
USING (
    user_id = auth.uid() 
    OR public.auth_has_global_access()
    OR public.auth_is_manager_of(user_id)
);

CREATE POLICY "samples_modify_policy" ON public.samples FOR ALL
USING (
    user_id = auth.uid() 
    OR public.auth_has_global_access()
);

-- Notificamos a PostgREST para recargar el schema y las funciones
NOTIFY pgrst, 'reload schema';
