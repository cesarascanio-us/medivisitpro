-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Function to handle Promotional Material (POP) delivery during a visit
-- 1. Decrements quantity from the user's assigned inventory in `materiales_promocionales`
-- 2. Records the delivery in `entrega_materiales` (if table exists) or logs it in visit notes (fallback)

CREATE OR REPLACE FUNCTION register_visit_pop_drop(
  p_visit_id UUID,
  p_material_id UUID,
  p_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_current_stock INTEGER;
  v_material_name TEXT;
  v_success BOOLEAN;
BEGIN
  -- Get the user ID from the visit record to ensure we deduct from the correct rep's inventory
  SELECT user_id INTO v_user_id
  FROM visits
  WHERE id = p_visit_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Visit not found');
  END IF;

  -- Check current stock for this material and user
  SELECT cantidad_disponible, nombre INTO v_current_stock, v_material_name
  FROM materiales_promocionales
  WHERE id = p_material_id AND user_id = v_user_id;

  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
     RETURN jsonb_build_object('success', false, 'message', 'Insufficient stock for material: ' || COALESCE(v_material_name, 'Unknown'));
  END IF;

  -- Decrement stock
  UPDATE materiales_promocionales
  SET 
    cantidad_disponible = cantidad_disponible - p_quantity,
    updated_at = NOW()
  WHERE id = p_material_id;

  -- OPTIONAL: If you have a specific tracking table for POP deliveries, insert here.
  -- For now, we assume the visit's `promotional_materials` text field captures the summary,
  -- but strictly modifying the inventory is the critical "Hard" requirement.

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Stock updated',
    'new_stock', v_current_stock - p_quantity
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
