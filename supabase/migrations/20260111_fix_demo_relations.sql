-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Fix contact_health_centers FK if missing
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'contact_health_centers'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'contact_health_centers_health_center_id_fkey'
) THEN
ALTER TABLE public.contact_health_centers
ADD CONSTRAINT contact_health_centers_health_center_id_fkey FOREIGN KEY (health_center_id) REFERENCES public.health_centers(id) ON DELETE CASCADE;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'contact_health_centers_contact_id_fkey'
) THEN -- Try to find if 'contacts' table is the parent
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'contacts'
) THEN
ALTER TABLE public.contact_health_centers
ADD CONSTRAINT contact_health_centers_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;
END IF;
END IF;
END IF;
END $$;
-- Fix doctors -> specialties FK if missing (to prevent similar errors on Doctors page)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'doctors'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'doctors_specialty_id_fkey'
) THEN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'specialties'
) THEN
ALTER TABLE public.doctors
ADD CONSTRAINT doctors_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id) ON DELETE
SET NULL;
END IF;
END IF;
END IF;
END $$;
-- Ensure RLS policies exist for these join tables to avoid 403s on selects
ALTER TABLE public.contact_health_centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.contact_health_centers;
CREATE POLICY "Enable read access for authenticated users" ON public.contact_health_centers FOR
SELECT TO authenticated USING (true);
-- Insert a dummy doctor if none exist (for demo purposes)
DO $$
DECLARE v_user_id uuid := auth.uid();
BEGIN IF v_user_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE user_id = v_user_id
) THEN
INSERT INTO public.doctors (user_id, name, specialty, city, status)
VALUES (
        v_user_id,
        'Dr. Demo Inicial',
        'Medicina General',
        'Ciudad Demo',
        'Activo'
    );
END IF;
END IF;
END $$;