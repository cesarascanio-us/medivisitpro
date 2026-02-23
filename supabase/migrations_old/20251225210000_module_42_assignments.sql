-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
-- 
-- Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
-- Queda estrictamente prohibida la copia, modificación, distribución,
-- ingeniería inversa o uso no autorizado de este código fuente.
-- ========================================================================

-- Module 42: Manager Sample Assignment & Control

-- 1. Create assignments table
CREATE TABLE IF NOT EXISTS sample_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id UUID NOT NULL REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

-- 2. Create items table
CREATE TABLE IF NOT EXISTS assignment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES sample_assignments(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 3. RLS Policies

ALTER TABLE sample_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_items ENABLE ROW LEVEL SECURITY;

-- Assignments Policies
CREATE POLICY "Managers can create assignments" ON sample_assignments
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('master', 'manager', 'supervisor')
        )
    );

CREATE POLICY "Managers can view assignments they created" ON sample_assignments
    FOR SELECT TO authenticated
    USING (
         created_by = auth.uid() OR
         EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role IN ('master', 'manager', 'supervisor')
        )
    );

CREATE POLICY "Reps can view assignments sent to them" ON sample_assignments
    FOR SELECT TO authenticated
    USING (representative_id = auth.uid());

CREATE POLICY "Reps can update status of their assignments" ON sample_assignments
    FOR UPDATE TO authenticated
    USING (representative_id = auth.uid())
    WITH CHECK (representative_id = auth.uid());

-- Items Policies
CREATE POLICY "Users can view items of assignments visible to them" ON assignment_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sample_assignments
            WHERE sample_assignments.id = assignment_items.assignment_id
            AND (
                sample_assignments.representative_id = auth.uid() OR
                sample_assignments.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_roles
                    WHERE user_id = auth.uid() AND role IN ('master', 'manager', 'supervisor')
                )
            )
        )
    );

CREATE POLICY "Managers can insert items" ON assignment_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sample_assignments
            WHERE sample_assignments.id = assignment_items.assignment_id
            AND sample_assignments.created_by = auth.uid()
        )
    );
