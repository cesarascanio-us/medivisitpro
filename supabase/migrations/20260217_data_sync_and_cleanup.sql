-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Data Sync and De-duplication
-- Description: Moves doctors and pharmacies from generic 'contacts' to their specialized tables.
-- Also removes duplicates in 'contacts', 'doctors', and 'pharmacies' tables.
-- 1. SYNC: Move doctors from 'contacts' to 'doctors' table
INSERT INTO public.doctors (
        organization_id,
        user_id,
        name,
        phone,
        email,
        address,
        city,
        specialty,
        observations,
        status,
        created_at
    )
SELECT organization_id,
    user_id,
    name,
    phone,
    email,
    address,
    city,
    specialty,
    notes as observations,
    'Activo' as status,
    created_at
FROM public.contacts
WHERE contact_type = 'doctor' ON CONFLICT DO NOTHING;
-- Avoid inserting exact same records if they exist
-- 2. SYNC: Move pharmacies from 'contacts' to 'pharmacies' table
INSERT INTO public.pharmacies (
        organization_id,
        user_id,
        name,
        phone,
        email,
        address,
        city,
        status,
        created_at
    )
SELECT organization_id,
    user_id,
    name,
    phone,
    email,
    address,
    city,
    'Activo' as status,
    created_at
FROM public.contacts
WHERE contact_type = 'pharmacy' ON CONFLICT DO NOTHING;
-- 3. CLEANUP: Delete the moved contacts from generic table to avoid duplicates in unified views
DELETE FROM public.contacts
WHERE contact_type IN ('doctor', 'pharmacy');
-- 4. DEDUPLICATION: Remove potential duplicates in 'contacts' (Now only non-doctor/non-pharmacy)
-- Logic: Keep the record with the most recent 'created_at' for same name, city, and type within an organization
WITH cte AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(name)),
            LOWER(TRIM(COALESCE(city, ''))),
            contact_type,
            organization_id
            ORDER BY created_at DESC
        ) as rn
    FROM public.contacts
)
DELETE FROM public.contacts
WHERE id IN (
        SELECT id
        FROM cte
        WHERE rn > 1
    );
-- 5. DEDUPLICATION: Remove duplicates in 'doctors'
WITH cte_doctors AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(name)),
            LOWER(TRIM(COALESCE(city, ''))),
            organization_id
            ORDER BY created_at DESC
        ) as rn
    FROM public.doctors
)
DELETE FROM public.doctors
WHERE id IN (
        SELECT id
        FROM cte_doctors
        WHERE rn > 1
    );
-- 6. DEDUPLICATION: Remove duplicates in 'pharmacies'
WITH cte_pharmacies AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(name)),
            LOWER(TRIM(COALESCE(city, ''))),
            organization_id
            ORDER BY created_at DESC
        ) as rn
    FROM public.pharmacies
)
DELETE FROM public.pharmacies
WHERE id IN (
        SELECT id
        FROM cte_pharmacies
        WHERE rn > 1
    );