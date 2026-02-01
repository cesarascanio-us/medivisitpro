-- Next-Gen Reporting Suite KPIs View
-- This view aggregates metrics for the current month
CREATE OR REPLACE VIEW view_gerencial_kpis AS WITH month_data AS (
        SELECT COALESCE(SUM(total), 0) as total_sales,
            COUNT(id) as total_orders
        FROM transfer_orders
        WHERE status != 'cancelled'
            AND date_trunc('month', created_at) = date_trunc('month', now())
    ),
    visit_data AS (
        SELECT COUNT(id) as total_visits,
            COUNT(DISTINCT contact_id) as visited_contacts
        FROM visits
        WHERE status = 'completed'
            AND date_trunc('month', scheduled_date) = date_trunc('month', now())
    ),
    total_contacts_data AS (
        SELECT COUNT(id) as total_active_contacts
        FROM contacts
    )
SELECT m.total_sales,
    CASE
        WHEN v.total_visits > 0 THEN (m.total_orders::float / v.total_visits::float) * 100
        ELSE 0
    END as visit_effectiveness,
    CASE
        WHEN c.total_active_contacts > 0 THEN (
            v.visited_contacts::float / c.total_active_contacts::float
        ) * 100
        ELSE 0
    END as portfolio_coverage
FROM month_data m,
    visit_data v,
    total_contacts_data c;
-- Sales by Zone View
CREATE OR REPLACE VIEW view_ventas_por_zona AS
SELECT z.name as zona,
    COALESCE(SUM(t.total), 0) as total_ventas
FROM zones z
    LEFT JOIN transfer_orders t ON t.zone_id = z.id
    AND t.status != 'cancelled'
    AND date_trunc('month', t.created_at) = date_trunc('month', now())
GROUP BY z.id,
    z.name;
-- Product Mix View (Category-based)
CREATE OR REPLACE VIEW view_product_mix AS
SELECT COALESCE(p.category, 'General') as category,
    COALESCE(SUM(ti.quantity), 0) as total_quantity
FROM transfer_order_items ti
    JOIN products p ON ti.product_id = p.id
    JOIN transfer_orders t ON ti.transfer_order_id = t.id
WHERE t.status != 'cancelled'
    AND date_trunc('month', t.created_at) = date_trunc('month', now())
GROUP BY p.category;
-- GRANT PERMISSIONS FOR API ACCESS
GRANT SELECT ON view_gerencial_kpis TO authenticated;
GRANT SELECT ON view_gerencial_kpis TO service_role;
GRANT SELECT ON view_ventas_por_zona TO authenticated;
GRANT SELECT ON view_ventas_por_zona TO service_role;
GRANT SELECT ON view_product_mix TO authenticated;
GRANT SELECT ON view_product_mix TO service_role;