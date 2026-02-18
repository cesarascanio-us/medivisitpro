-- SCRIPT DE UNIFICACIÓN DE ORGANIZACIÓN
-- Este script mueve TODOS los registros de médicos, farmacias y contactos
-- a la organización principal detectada en la auditoría (la que tiene más datos).
-- Target Org ID: c6f517ba-204d-4f47-9db2-1af01214a3f9
DO $$
DECLARE target_org_id UUID := 'c6f517ba-204d-4f47-9db2-1af01214a3f9';
updated_doctors INT;
updated_pharmacies INT;
updated_contacts INT;
BEGIN RAISE NOTICE 'Iniciando unificación de datos hacia la Org ID: %',
target_org_id;
-- 1. Unificar Médicos
UPDATE doctors
SET organization_id = target_org_id
WHERE organization_id != target_org_id
    OR organization_id IS NULL;
GET DIAGNOSTICS updated_doctors = ROW_COUNT;
RAISE NOTICE 'Médicos movidos a la organización principal: %',
updated_doctors;
-- 2. Unificar Farmacias
UPDATE pharmacies
SET organization_id = target_org_id
WHERE organization_id != target_org_id
    OR organization_id IS NULL;
GET DIAGNOSTICS updated_pharmacies = ROW_COUNT;
RAISE NOTICE 'Farmacias movidas a la organización principal: %',
updated_pharmacies;
-- 3. Unificar Contactos (Tiendas Naturistas, Droguerías, etc.)
UPDATE contacts
SET organization_id = target_org_id
WHERE organization_id != target_org_id
    OR organization_id IS NULL;
GET DIAGNOSTICS updated_contacts = ROW_COUNT;
RAISE NOTICE 'Contactos movidos a la organización principal: %',
updated_contacts;
-- 4. Unificar Centros de Salud (si aplica)
UPDATE health_centers
SET organization_id = target_org_id
WHERE organization_id != target_org_id
    OR organization_id IS NULL;
RAISE NOTICE 'Centros de Salud unificados (si existían fuera de la org).';
RAISE NOTICE '=========================================';
RAISE NOTICE '   PROCESO COMPLETADO ÉXITOSAMENTE       ';
RAISE NOTICE '=========================================';
END $$;