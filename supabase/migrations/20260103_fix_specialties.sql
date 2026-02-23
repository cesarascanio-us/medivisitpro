-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Fix Doctor Specialties Table & Relationships
-- Date: 2026-01-03

-- 1. Create specialties table if not exists
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    detail TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clean up duplicates safely (handling Foreign Key dependencies)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Only proceed if we have duplicates
    FOR r IN
        SELECT s1.id as bad_id, s2.id as good_id
        FROM public.specialties s1
        JOIN public.specialties s2 ON TRIM(s1.name) = TRIM(s2.name) AND s1.id > s2.id
    LOOP
        -- 1. Check if doctors table has specialty_id column and reassign if it does
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'specialty_id') THEN
            UPDATE public.doctors SET specialty_id = r.good_id WHERE specialty_id = r.bad_id;
        END IF;
        
        -- 2. Delete the duplicate specialty
        DELETE FROM public.specialties WHERE id = r.bad_id;
    END LOOP;
END $$;

-- 3. Ensure a unique index exists on the name column for ON CONFLICT to work
CREATE UNIQUE INDEX IF NOT EXISTS specialties_name_idx ON public.specialties (name);

-- 4. Add specialty_id to doctors if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'specialty_id') THEN
        ALTER TABLE public.doctors ADD COLUMN specialty_id UUID REFERENCES public.specialties(id);
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Read: Everyone authenticated (or public if needed)
CREATE POLICY "Allow authenticated read access for specialties" 
ON public.specialties FOR SELECT 
TO authenticated 
USING (true);

-- CRUD: Only Master and Admin
CREATE POLICY "Allow full access for specialties to admin and master" 
ON public.specialties FOR ALL 
TO authenticated 
USING (
    (SELECT role FROM public.user_roles_plain WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'master')
);

-- 5. Seed initial data
INSERT INTO public.specialties (name, detail) VALUES
('Cardiología', 'Especialidad médica que se ocupa de las afecciones del corazón y del aparato circulatorio.'),
('Pediatría', 'Rama de la medicina que involucra la atención médica de bebés, niños y adolescentes.'),
('Ginecología', 'Práctica de la medicina que trata con el sistema reproductivo femenino.'),
('Dermatología', 'Rama de la medicina que se ocupa de la piel.'),
('Oftalmología', 'Rama de la medicina que se ocupa de los trastornos oculares.'),
('Traumatología', 'Rama de la medicina que se ocupa de las lesiones provocadas por traumatismos.'),
('Medicina Interna', 'Especialidad que se encarga de la atención integral del adulto.'),
('Gastroenterología', 'Especialidad que se ocupa del sistema digestivo y sus trastornos.'),
('Urología', 'Especialidad que se ocupa del sistema urinario.'),
('Endocrinología', 'Especialidad que se ocupa del sistema endocrino.')
ON CONFLICT (name) DO NOTHING;

-- 6. Attempt to link existing doctors by Name if possible (Optional but helpful)
-- This assumes doctors.specialty (TEXT) matches specialties.name
UPDATE public.doctors d
SET specialty_id = s.id
FROM public.specialties s
WHERE d.specialty = s.name
AND d.specialty_id IS NULL;
