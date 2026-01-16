-- Migration: Create rep_stats_summary table for performance optimization
-- This table maintains pre-calculated statistics for sales representatives
-- Updated automatically via triggers on visits and transfer_orders tables

CREATE TABLE IF NOT EXISTS rep_stats_summary (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    effectiveness DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rep_stats_total_sales ON rep_stats_summary(total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_rep_stats_effectiveness ON rep_stats_summary(effectiveness DESC);

-- Add RLS policies
ALTER TABLE rep_stats_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
    ON rep_stats_summary
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all stats"
    ON rep_stats_summary
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('master', 'admin', 'manager')
        )
    );

COMMENT ON TABLE rep_stats_summary IS 'Pre-calculated statistics for sales representatives, updated via triggers';
