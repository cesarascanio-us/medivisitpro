-- =====================================================
-- UPDATE ROLE HIERARCHY (FIXED)
-- Date: 2026-01-01
-- Description: Updates the user_role check constraint to support the new hierarchy.
-- Roles: master, admin, manager (Gerente), chief (Jefe), coordinator (Coordinador), 
--        supervisor (Supervisor), telemarketing (Telemarketing), representative (Representante),
--        doctor, pharmacist, service_chief
-- =====================================================

DO $$
BEGIN
    -- 1. Drop existing check constraint if exists
    ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

    -- 2. Add new check constraint with expanded roles
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN (
        'master',
        'admin',
        'manager',          -- Gerente
        'chief',            -- Jefe
        'coordinator',      -- Coordinador
        'supervisor',       -- Supervisor
        'telemarketing',    -- Telemarketing
        'representative',   -- Representante
        'doctor',
        'pharmacist',
        'service_chief'
    ));

    RAISE NOTICE 'Role hierarchy updated successfully';
END $$;
