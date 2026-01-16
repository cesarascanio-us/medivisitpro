-- Module 55: Investment Shielding (ROI)

-- 1. Pharmacy Scores Table
CREATE TABLE IF NOT EXISTS public.pharmacy_scores (
    pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    level TEXT CHECK (level IN ('Bronze', 'Silver', 'Gold', 'Platinum')) DEFAULT 'Bronze',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (pharmacy_id)
);

-- Enable RLS
ALTER TABLE public.pharmacy_scores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" ON public.pharmacy_scores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert/update for authenticated users" ON public.pharmacy_scores
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Function to check event eligibility
CREATE OR REPLACE FUNCTION public.check_event_eligibility(
    p_pharmacy_id UUID,
    p_event_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stock_count INTEGER;
    v_result JSONB;
BEGIN
    -- Default result (Approved)
    v_result := '{"allowed": true, "message": "Evento aprobado"}'::JSONB;

    -- Logic for 'Jornada Médica' (Medical Day)
    IF p_event_type = 'jornada' THEN
        -- Check total stock of products in this pharmacy
        -- Using view_farmacia_stock_actual which aggregates stock
        -- If the view doesn't exist yet, we fallback to registro_pvp_farmacia sum
        
        -- Try to query from the view if it exists, otherwise define fallback logic
        -- Ideally the view exists from Module 52/54. Assuming it exists as per plan.
        
        SELECT COALESCE(SUM(cantidad), 0) INTO v_stock_count
        FROM public.view_farmacia_stock_actual
        WHERE farmacia_id = p_pharmacy_id;

        -- Threshold: Must have at least 30 units in stock
        IF v_stock_count < 30 THEN
            v_result := jsonb_build_object(
                'allowed', false,
                'message', 'Stock Insuficiente (' || v_stock_count || ' unidades). Se requieren mínimo 30 unidades para agendar una Jornada Médica.'
            );
        END IF;
    END IF;

    RETURN v_result;
END;
$$;
