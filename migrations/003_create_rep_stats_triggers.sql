-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Migration: Create triggers for automatic rep stats updates
-- These triggers maintain rep_stats_summary in real-time

-- ============================================
-- TRIGGER 1: Update stats when a visit is created
-- ============================================

CREATE OR REPLACE FUNCTION update_rep_stats_on_visit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO rep_stats_summary (user_id, total_visits, last_updated)
    VALUES (NEW.user_id, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_visits = rep_stats_summary.total_visits + 1,
        effectiveness = CASE 
            WHEN rep_stats_summary.total_visits + 1 > 0 
            THEN (rep_stats_summary.total_orders::DECIMAL / (rep_stats_summary.total_visits + 1)) * 100
            ELSE 0
        END,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rep_stats_visit
AFTER INSERT ON visits
FOR EACH ROW
EXECUTE FUNCTION update_rep_stats_on_visit();

-- ============================================
-- TRIGGER 2: Update stats when an order is created
-- ============================================

CREATE OR REPLACE FUNCTION update_rep_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO rep_stats_summary (user_id, total_sales, total_orders, last_updated)
    VALUES (NEW.user_id, NEW.total, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_sales = rep_stats_summary.total_sales + NEW.total,
        total_orders = rep_stats_summary.total_orders + 1,
        effectiveness = CASE 
            WHEN rep_stats_summary.total_visits > 0 
            THEN ((rep_stats_summary.total_orders + 1)::DECIMAL / rep_stats_summary.total_visits) * 100
            ELSE 0
        END,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rep_stats_order
AFTER INSERT ON transfer_orders
FOR EACH ROW
EXECUTE FUNCTION update_rep_stats_on_order();

-- ============================================
-- TRIGGER 3: Update stats when an order total changes
-- ============================================

CREATE OR REPLACE FUNCTION update_rep_stats_on_order_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total <> OLD.total THEN
        UPDATE rep_stats_summary
        SET 
            total_sales = total_sales - OLD.total + NEW.total,
            last_updated = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rep_stats_order_update
AFTER UPDATE ON transfer_orders
FOR EACH ROW
WHEN (NEW.total IS DISTINCT FROM OLD.total)
EXECUTE FUNCTION update_rep_stats_on_order_update();

COMMENT ON FUNCTION update_rep_stats_on_visit() IS 'Automatically updates rep stats when a visit is created';
COMMENT ON FUNCTION update_rep_stats_on_order() IS 'Automatically updates rep stats when an order is created';
COMMENT ON FUNCTION update_rep_stats_on_order_update() IS 'Automatically updates rep stats when an order total changes';
