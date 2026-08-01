-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
--
-- MIGRACIÓN: Visibilidad Jerárquica por Zona
-- Descripción: Políticas RLS para visibilidad de datos del flujo operacional
--   Representante → solo sus datos
--   Supervisor → sus representantes de zona
--   Coordinador → supervisores y reps de sus zonas
--   Gerente/Admin → toda la organización
-- 
-- INSTRUCCIONES: Ejecutar en Supabase → SQL Editor
-- ========================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 1: Función auxiliar de visibilidad por zona
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_visible_user_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Siempre te ves a ti mismo
  SELECT auth.uid()

  UNION

  -- SUPERVISOR / CHIEF: ve representantes de su misma zona
  SELECT urp.user_id
  FROM user_roles_plain urp
  WHERE urp.role = 'representative'
    AND urp.zone_id IN (
      SELECT zone_id FROM user_roles_plain
      WHERE user_id = auth.uid()
        AND role IN ('supervisor', 'chief')
        AND zone_id IS NOT NULL
    )
    AND EXISTS (
      SELECT 1 FROM user_roles_plain
      WHERE user_id = auth.uid()
        AND role IN ('supervisor', 'chief')
    )

  UNION

  -- COORDINADOR: ve supervisores, chiefs y representantes de sus zonas
  SELECT urp.user_id
  FROM user_roles_plain urp
  WHERE urp.role IN ('supervisor', 'chief', 'representative')
    AND urp.zone_id IN (
      SELECT zone_id FROM user_roles_plain
      WHERE user_id = auth.uid()
        AND role = 'coordinator'
        AND zone_id IS NOT NULL
    )
    AND EXISTS (
      SELECT 1 FROM user_roles_plain
      WHERE user_id = auth.uid()
        AND role = 'coordinator'
    )

  UNION

  -- GERENTE / ADMIN / ORG_ADMIN: ve todos los usuarios de su organización
  SELECT urp.user_id
  FROM user_roles_plain urp
  WHERE urp.organization_id = (
    SELECT organization_id FROM user_roles_plain
    WHERE user_id = auth.uid()
    LIMIT 1
  )
  AND EXISTS (
    SELECT 1 FROM user_roles_plain
    WHERE user_id = auth.uid()
      AND role IN ('manager', 'admin', 'organization_admin')
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 2: RLS para daily_plans
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily plans" ON public.daily_plans;
DROP POLICY IF EXISTS "hierarchical_view_daily_plans" ON public.daily_plans;
DROP POLICY IF EXISTS "own_insert_daily_plans" ON public.daily_plans;
DROP POLICY IF EXISTS "own_update_daily_plans" ON public.daily_plans;
DROP POLICY IF EXISTS "own_delete_daily_plans" ON public.daily_plans;

-- SELECT: visibilidad jerárquica por zona
CREATE POLICY "hierarchical_view_daily_plans"
  ON public.daily_plans FOR SELECT
  USING (user_id IN (SELECT get_visible_user_ids()));

-- INSERT: solo el propio usuario
CREATE POLICY "own_insert_daily_plans"
  ON public.daily_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: solo el propio usuario
CREATE POLICY "own_update_daily_plans"
  ON public.daily_plans FOR UPDATE
  USING (user_id = auth.uid());

-- DELETE: solo el propio usuario
CREATE POLICY "own_delete_daily_plans"
  ON public.daily_plans FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 3: RLS para daily_plan_items
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.daily_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own plan items" ON public.daily_plan_items;
DROP POLICY IF EXISTS "hierarchical_view_daily_plan_items" ON public.daily_plan_items;
DROP POLICY IF EXISTS "own_insert_daily_plan_items" ON public.daily_plan_items;
DROP POLICY IF EXISTS "own_update_daily_plan_items" ON public.daily_plan_items;
DROP POLICY IF EXISTS "own_delete_daily_plan_items" ON public.daily_plan_items;

CREATE POLICY "hierarchical_view_daily_plan_items"
  ON public.daily_plan_items FOR SELECT
  USING (user_id IN (SELECT get_visible_user_ids()));

CREATE POLICY "own_insert_daily_plan_items"
  ON public.daily_plan_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_update_daily_plan_items"
  ON public.daily_plan_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "own_delete_daily_plan_items"
  ON public.daily_plan_items FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 4: RLS para visits
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own visits" ON public.visits;
DROP POLICY IF EXISTS "hierarchical_view_visits" ON public.visits;
DROP POLICY IF EXISTS "own_insert_visits" ON public.visits;
DROP POLICY IF EXISTS "own_update_visits" ON public.visits;
DROP POLICY IF EXISTS "own_delete_visits" ON public.visits;

CREATE POLICY "hierarchical_view_visits"
  ON public.visits FOR SELECT
  USING (user_id IN (SELECT get_visible_user_ids()));

CREATE POLICY "own_insert_visits"
  ON public.visits FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_update_visits"
  ON public.visits FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "own_delete_visits"
  ON public.visits FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN (ejecutar después para confirmar)
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT COUNT(*) FROM daily_plans;     -- Debe devolver los planes del usuario actual
-- SELECT COUNT(*) FROM daily_plan_items; -- Debe devolver ítems del usuario actual
-- SELECT COUNT(*) FROM visits;           -- Debe devolver visitas del usuario actual

-- Mensaje de éxito
DO $$ BEGIN
  RAISE NOTICE 'Migración de visibilidad jerárquica aplicada correctamente.';
  RAISE NOTICE 'Función get_visible_user_ids() creada.';
  RAISE NOTICE 'RLS aplicado a: daily_plans, daily_plan_items, visits';
END $$;
