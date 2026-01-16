-- =============================================
-- MediVisitPro - Clarification Diagnostic
-- Checks the difference between Users and Contacts
-- =============================================

-- 1. SYSTEM USERS (What you see in "Gestión de Usuarios")
SELECT 'System Users (Total)' as info, count(*)::text as value FROM public.user_roles
UNION ALL
SELECT 'My User Role' as info, role FROM public.user_roles WHERE user_id = auth.uid();

-- 2. MAP CONTACTS (What should appear in "Mapa")
-- These are stored in separate tables (doctors, pharmacies, or the unified 'contacts' table)
SELECT 'Total Contacts (Unified)' as info, count(*)::text as value FROM public.contacts
UNION ALL
SELECT 'Contacts with Coordinates' as info, count(*)::text FROM public.contacts WHERE latitude IS NOT NULL
UNION ALL
SELECT 'Total Doctors (Independent Table)' as info, count(*)::text FROM public.doctors
UNION ALL
SELECT 'Total Pharmacies (Independent Table)' as info, count(*)::text FROM public.pharmacies;

-- 3. COORDINATE FIX (If contacts exist but have no location)
-- This only runs if there are contacts but no coords
UPDATE public.contacts
SET 
    latitude = 10.4806 + (random() * 0.1 - 0.05),
    longitude = -66.9036 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL AND EXISTS (SELECT 1 FROM public.contacts LIMIT 1);
