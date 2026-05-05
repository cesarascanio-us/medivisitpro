/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Security Advisor Final Fix - MediVisitPro
 ======================================================================== */

-- 1. FIX: Policy Exists but RLS is Disabled (Critical)
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. FIX: RLS Disabled in Public for n8n/Service Tables
-- Estos cambios aseguran que las tablas de automatización no sean accesibles públicamente.
-- Al habilitar RLS sin políticas, solo el dueño (postgres/service_role) puede acceder.

DO $$ 
DECLARE 
    tbl text;
    tables_to_fix text[] := ARRAY[
        'user',
        'webhook_entity',
        'instance_version_history',
        'migrations',
        'folder',
        'folder_tag',
        'workflows_tags',
        'instance_ai_threads',
        'instance_ai_messages',
        'credentials_entity',
        'insights_metadata',
        'execution_entity',
        'installed_packages',
        'workflow',
        'shared_workflow',
        'tag',
        'execution_data',
        'active_workflow',
        'event_destinations',
        'event_storage',
        'insights_raw',
        'workflow_statistics',
        'tag_entity',
        'scope',
        'test_case_execution',
        'data_table',
        'workflow_history',
        'execution_annotations',
        'execution_annotation_tags',
        'annotation_tag_entity',
        'processed_data',
        'secrets_provider_connection',
        'dynamic_credential_entry',
        'chat_hub_tools',
        'auth_user',
        'auth_identity',
        'auth_session',
        'project_data',
        'variables',
        'instance_ai_run_snapshots',
        'workflow_entity',
        'role_scope',
        'project',
        'insights_by_period',
        'settings',
        'chat_hub_agents',
        'installed_nodes',
        'chat_hub_sessions',
        'oauth_clients',
        'oauth_authorization_codes',
        'oauth_access_tokens',
        'role',
        'dynamic_credential_user_entry',
        'execution_data_v2',
        'webhook_execution_entity',
        'tag_usage',
        'environment_variable',
        'user_api_keys',
        'oauth_refresh_tokens',
        'binary_data',
        'dynamic_credential_resolver',
        'data_table_column',
        'chat_hub_messages',
        'oauth_user_consents',
        'workflow_published_version',
        'chat_hub_session_tools',
        'instance_ai_resources',
        'instance_ai_observational_memory',
        'workflow_publish_history',
        'workflow_dependency',
        'chat_hub_agent_tools',
        'test_run',
        'project_secrets_provider_access',
        'role_mapping_rule',
        'role_mapping_rule_project',
        'credential_dependency',
        'workflow_builder_session',
        'instance_ai_workflow_snapshots',
        'auth_provider_sync_history',
        'token_exchange_jti',
        'execution_metadata',
        'project_relation',
        'shared_credentials',
        'invalid_auth_token'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_to_fix LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
            RAISE NOTICE 'RLS habilitado en la tabla: %', tbl;
        END IF;
    END LOOP;
END $$;

-- 3. FIX: SECURITY DEFINER Warnings (is_system_master)
-- Convertimos a SECURITY INVOKER usando ALTER para evitar romper dependencias de políticas RLS.

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'is_system_master') THEN
        -- Cambiamos el modo de seguridad sin borrar la función
        ALTER FUNCTION public.is_system_master() SECURITY INVOKER;
        
        -- Revocamos permisos innecesarios
        REVOKE EXECUTE ON FUNCTION public.is_system_master() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION public.is_system_master() FROM anon;
        
        RAISE NOTICE 'Seguridad de is_system_master actualizada a SECURITY INVOKER.';
    END IF;
END $$;

-- 4. REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';

/* ========================================================================
 INSTRUCCIONES PARA EL USUARIO:
 1. Copia este SQL.
 2. Ve al SQL Editor en tu Dashboard de Supabase.
 3. Pega y ejecuta (Run).
 4. Regresa al Security Advisor y presiona 'Refresh'.
 ======================================================================== */
