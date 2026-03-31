-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Module 54: Sell-Out Strategy
-- 1. Pharmacy Trainings Table
CREATE TABLE IF NOT EXISTS public.pharmacy_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES public.contacts(id) NOT NULL,
    topics TEXT[] NOT NULL,
    attendees_count INTEGER DEFAULT 1,
    evidence_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS for pharmacy_trainings
ALTER TABLE public.pharmacy_trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.pharmacy_trainings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.pharmacy_trainings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Add visibility column to visits
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS visibility_audit JSONB DEFAULT '{}'::jsonb;

-- 3. Get Nearby Pharmacies Function
CREATE OR REPLACE FUNCTION public.get_nearby_pharmacies(
    p_doctor_id UUID,
    p_radius_km FLOAT DEFAULT 1.0
)
RETURNS TABLE (
    pharmacy_id UUID,
    name TEXT,
    distance_meters FLOAT,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT
) AS $$
DECLARE
    v_doc_lat FLOAT;
    v_doc_lng FLOAT;
BEGIN
    -- Get Doctor Coordinates
    SELECT latitude, longitude INTO v_doc_lat, v_doc_lng
    FROM public.contacts
    WHERE id = p_doctor_id;

    IF v_doc_lat IS NULL OR v_doc_lng IS NULL THEN
        RETURN;
    END IF;

    -- Calculate distance using Haversine formula approximation
    -- 6371000 is Earth radius in meters
    RETURN QUERY
    SELECT 
        c.id, 
        c.name,
        (
            6371000 * acos(
                least(1.0, greatest(-1.0, 
                    cos(radians(v_doc_lat)) * cos(radians(c.latitude)) *
                    cos(radians(c.longitude) - radians(v_doc_lng)) +
                    sin(radians(v_doc_lat)) * sin(radians(c.latitude))
                ))
            )
        ) AS distance,
        c.address,
        c.latitude,
        c.longitude
    FROM public.contacts c
    WHERE c.contact_type = 'pharmacy'
      AND c.latitude IS NOT NULL 
      AND c.longitude IS NOT NULL
      AND (
            6371 * acos(
                least(1.0, greatest(-1.0,
                    cos(radians(v_doc_lat)) * cos(radians(c.latitude)) *
                    cos(radians(c.longitude) - radians(v_doc_lng)) +
                    sin(radians(v_doc_lat)) * sin(radians(c.latitude))
                ))
            )
        ) <= p_radius_km
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
