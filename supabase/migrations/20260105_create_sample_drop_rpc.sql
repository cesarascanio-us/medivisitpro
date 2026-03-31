-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Function to register sample delivery and update inventory
CREATE OR REPLACE FUNCTION register_visit_sample_drop(
    p_visit_id UUID,
    p_product_id UUID,
    p_quantity INTEGER,
    p_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stock_id UUID;
    v_current_stock INTEGER;
    v_user_id UUID;
    v_lote TEXT;
BEGIN
    -- Get current user
    v_user_id := auth.uid();

    -- Parse Lot from notes if possible, or find first available stock batch for this product
    -- For simplicity/FIFO, we'll pick the batch with earliest expiry that has stock
    SELECT id, cantidad_asignada, lote INTO v_stock_id, v_current_stock, v_lote
    FROM inventario_muestras
    WHERE product_id = p_product_id
      AND user_id = v_user_id
      AND cantidad_asignada >= p_quantity
    ORDER BY fecha_vencimiento ASC
    LIMIT 1;

    IF v_stock_id IS NULL THEN
        RAISE EXCEPTION 'No stock available for product %', p_product_id;
    END IF;

    -- Decrement stock
    UPDATE inventario_muestras
    SET cantidad_asignada = cantidad_asignada - p_quantity,
        updated_at = NOW()
    WHERE id = v_stock_id;

    -- Record delivery
    INSERT INTO entrega_muestras (
        visit_id,
        stock_muestra_id,
        cantidad_entregada,
        fecha_entrega,
        user_id
    ) VALUES (
        p_visit_id,
        v_stock_id,
        p_quantity,
        CURRENT_DATE,
        v_user_id
    );

END;
$$;
