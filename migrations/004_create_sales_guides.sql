-- Migration: Create sales_guides table for SPIN selling methodology
-- This table stores contextual sales questions based on product and entity type

CREATE TABLE IF NOT EXISTS sales_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    entity_target TEXT NOT NULL CHECK (entity_target IN ('doctor', 'farmacia', 'both')),
    question_type TEXT CHECK (question_type IN ('situation', 'problem', 'implication', 'need_payoff')),
    question_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_guides_product ON sales_guides(product_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sales_guides_entity ON sales_guides(entity_target) WHERE is_active = TRUE;

-- Add RLS
ALTER TABLE sales_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active sales guides"
    ON sales_guides
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Only admins can modify sales guides"
    ON sales_guides
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('master', 'admin', 'manager')
        )
    );

-- Insert sample SPIN questions for common scenarios
INSERT INTO sales_guides (product_id, entity_target, question_type, question_text, display_order) VALUES
-- Generic questions for all products
(NULL, 'doctor', 'situation', '¿Cuál es el perfil típico de pacientes que atiende en su consulta?', 1),
(NULL, 'doctor', 'problem', '¿Qué desafíos enfrenta con los tratamientos actuales disponibles?', 2),
(NULL, 'doctor', 'implication', 'Si los pacientes no responden bien, ¿cómo afecta esto su práctica?', 3),
(NULL, 'doctor', 'need_payoff', '¿Qué beneficios buscaría en una nueva opción terapéutica?', 4),

(NULL, 'farmacia', 'situation', '¿Cuál es el perfil de sus clientes principales?', 1),
(NULL, 'farmacia', 'problem', '¿Qué productos tienen mayor rotación vs cuáles se quedan en anaquel?', 2),
(NULL, 'farmacia', 'implication', '¿Cómo afecta al  negocio tener productos de baja rotación?', 3),
(NULL, 'farmacia', 'need_payoff', '¿Qué características valoraría en un producto de alta demanda?', 4);

COMMENT ON TABLE sales_guides IS 'SPIN methodology sales questions contextual to products and entity types';
