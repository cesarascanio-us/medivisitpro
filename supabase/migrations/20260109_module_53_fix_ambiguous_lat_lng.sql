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
    SELECT c.latitude, c.longitude INTO v_doc_lat, v_doc_lng
    FROM public.contacts c
    WHERE c.id = p_doctor_id;

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
    ORDER BY distance ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
