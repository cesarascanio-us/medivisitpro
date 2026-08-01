-- ========================================================================
-- Corrección de Políticas RLS y Jerarquía de Usuarios
-- Fecha: 2026-05-25
-- Descripción: Ajusta la visibilidad jerárquica para Master, Admin, 
-- Manager, Coordinador, Supervisor, Telemarketing y Representante.
-- Asegura que el insert asigne user_id.
-- ========================================================================

-- PASO 1: Eliminar políticas anteriores problemáticas
DROP POLICY IF EXISTS "Org Contact Access" ON contacts;
DROP POLICY IF EXISTS "Org Doctors Access" ON doctors;
DROP POLICY IF EXISTS "Org Pharmacies Access" ON pharmacies;
DROP POLICY IF EXISTS "Org Drugstores Access" ON drugstores;
DROP POLICY IF EXISTS "Org Health Centers Access" ON health_centers;
DROP POLICY IF EXISTS "Org Visits Access" ON visits;

-- Limpiar las políticas nuevas en caso de que se vuelva a correr el script
DROP POLICY IF EXISTS "Hierarchy Contact Access" ON contacts;
DROP POLICY IF EXISTS "Hierarchy Pharmacies Access" ON pharmacies;
DROP POLICY IF EXISTS "Hierarchy Drugstores Access" ON drugstores;
DROP POLICY IF EXISTS "Hierarchy Doctors Access" ON doctors;
DROP POLICY IF EXISTS "Hierarchy Health Centers Access" ON health_centers;
DROP POLICY IF EXISTS "Hierarchy Visits Access" ON visits;

-- PASO 2: Función de soporte para jerarquía profunda (opcional pero más robusta)
CREATE OR REPLACE FUNCTION is_in_my_hierarchy(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    my_role text;
    my_uid uuid := auth.uid();
BEGIN
    my_role := get_my_role();
    
    -- Si soy el mismo usuario
    IF my_uid = target_user_id THEN RETURN true; END IF;
    
    -- El supervisor ve a los representantes (hijos directos)
    IF my_role = 'supervisor' THEN
        RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = target_user_id AND supervisor_id = my_uid);
    END IF;

    -- El coordinador ve supervisores, telemarketing y representantes bajo su rama
    IF my_role = 'coordinator' THEN
        RETURN EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = target_user_id AND (
                supervisor_id = my_uid OR 
                supervisor_id IN (SELECT user_id FROM user_roles WHERE supervisor_id = my_uid)
            )
        );
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- PASO 3: Trigger para asegurar que user_id tenga un valor si se manda nulo (Cargas masivas)
CREATE OR REPLACE FUNCTION set_default_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_user_id_contacts ON contacts;
CREATE TRIGGER ensure_user_id_contacts BEFORE INSERT ON contacts FOR EACH ROW EXECUTE FUNCTION set_default_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_doctors ON doctors;
CREATE TRIGGER ensure_user_id_doctors BEFORE INSERT ON doctors FOR EACH ROW EXECUTE FUNCTION set_default_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_pharmacies ON pharmacies;
CREATE TRIGGER ensure_user_id_pharmacies BEFORE INSERT ON pharmacies FOR EACH ROW EXECUTE FUNCTION set_default_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_drugstores ON drugstores;
CREATE TRIGGER ensure_user_id_drugstores BEFORE INSERT ON drugstores FOR EACH ROW EXECUTE FUNCTION set_default_user_id();

-- PASO 4: Nuevas Políticas RLS
-- CONTACTS
CREATE POLICY "Hierarchy Contact Access" ON contacts
    FOR ALL USING (
        get_my_role() = 'master' OR 
        (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('manager', 'chief') OR
                is_in_my_hierarchy(user_id)
            )
        )
    ) WITH CHECK (
        get_my_role() = 'master' OR 
        (organization_id = get_my_organization_id())
    );

-- PHARMACIES
CREATE POLICY "Hierarchy Pharmacies Access" ON pharmacies
    FOR ALL USING (
        get_my_role() = 'master' OR 
        (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('manager', 'chief', 'telemarketing') OR
                is_in_my_hierarchy(user_id)
            )
        )
    ) WITH CHECK (
        get_my_role() = 'master' OR 
        (organization_id = get_my_organization_id())
    );

-- DRUGSTORES
CREATE POLICY "Hierarchy Drugstores Access" ON drugstores
    FOR ALL USING (
        get_my_role() = 'master' OR 
        (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('manager', 'chief', 'telemarketing') OR
                is_in_my_hierarchy(user_id)
            )
        )
    ) WITH CHECK (
        get_my_role() = 'master' OR 
        (organization_id = get_my_organization_id())
    );

-- DOCTORS
CREATE POLICY "Hierarchy Doctors Access" ON doctors
    FOR ALL USING (
        get_my_role() = 'master' OR 
        (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('manager', 'chief') OR
                is_in_my_hierarchy(user_id)
            )
        )
    ) WITH CHECK (
        get_my_role() = 'master' OR 
        (organization_id = get_my_organization_id())
    );

-- HEALTH CENTERS
CREATE POLICY "Hierarchy Health Centers Access" ON health_centers
    FOR ALL USING (
        get_my_role() = 'master' OR 
        (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('manager', 'chief') OR
                is_in_my_hierarchy(user_id)
            )
        )
    ) WITH CHECK (
        get_my_role() = 'master' OR 
        (organization_id = get_my_organization_id())
    );

-- VISITS
CREATE POLICY "Hierarchy Visits Access" ON visits
    FOR ALL USING (
        get_my_role() = 'master' OR 
        (
            organization_id = get_my_organization_id() AND (
                get_my_role() IN ('manager', 'chief') OR
                is_in_my_hierarchy(user_id)
            )
        )
    ) WITH CHECK (
        get_my_role() = 'master' OR 
        (organization_id = get_my_organization_id())
    );
