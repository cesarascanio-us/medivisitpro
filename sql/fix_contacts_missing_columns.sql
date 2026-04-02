/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

   Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
   ======================================================================== */

-- 1. ADD MISSING COLUMNS TO CONTACTS
-- These columns are required by Drugstores.tsx, NaturalStores.tsx and ContactDialog.tsx
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS rif TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS sanitary_permits BOOLEAN DEFAULT false;

-- 2. ENSURE RLS IS CORRECT (Optional but good for industrialization)
-- Assuming they are already using unified RLS, but if not, we ensure they can see what they created.
-- Policy for inserting:
-- CREATE POLICY "Users can insert their own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload config';

-- 4. LOG THE CHANGE
INSERT INTO public.audit_logs (
    table_name, 
    operation, 
    new_data, 
    changed_by, 
    organization_id
) VALUES (
    'contacts', 
    'UPGRADE_SCHEMA', 
    '{"added": ["rif", "owner_name", "sanitary_permits"]}'::jsonb, 
    'SYSTEM_UPGRADE', 
    (SELECT id FROM public.organizations LIMIT 1)
);
