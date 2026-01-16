-- ========================================
-- Material POP Module - Database Schema
-- ========================================

-- 1. pop_materials: Catálogo de materiales promocionales
CREATE TABLE IF NOT EXISTS public.pop_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text DEFAULT 'General',
    description text,
    image_url text,
    sku text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. pop_assignments: Asignaciones de material POP
CREATE TABLE IF NOT EXISTS public.pop_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    representative_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 3. pop_assignment_items: Ítems de cada asignación
CREATE TABLE IF NOT EXISTS public.pop_assignment_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES public.pop_assignments(id) ON DELETE CASCADE,
    material_id uuid REFERENCES public.pop_materials(id) ON DELETE SET NULL,
    quantity integer NOT NULL DEFAULT 1
);

-- ========================================
-- RLS Policies
-- ========================================

-- Enable RLS
ALTER TABLE public.pop_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pop_assignment_items ENABLE ROW LEVEL SECURITY;

-- pop_materials: todos pueden leer, solo autenticados pueden insertar/actualizar
CREATE POLICY "Allow read for authenticated" ON public.pop_materials
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated" ON public.pop_materials
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON public.pop_materials
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated" ON public.pop_materials
    FOR DELETE TO authenticated USING (true);

-- pop_assignments: similar a sample_assignments
CREATE POLICY "Allow read for authenticated" ON public.pop_assignments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated" ON public.pop_assignments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON public.pop_assignments
    FOR UPDATE TO authenticated USING (true);

-- pop_assignment_items
CREATE POLICY "Allow read for authenticated" ON public.pop_assignment_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated" ON public.pop_assignment_items
    FOR INSERT TO authenticated WITH CHECK (true);

-- ========================================
-- Índices
-- ========================================
CREATE INDEX IF NOT EXISTS idx_pop_assignments_representative ON public.pop_assignments(representative_id);
CREATE INDEX IF NOT EXISTS idx_pop_assignments_created_by ON public.pop_assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_pop_assignment_items_assignment ON public.pop_assignment_items(assignment_id);

-- Reload config
NOTIFY pgrst, 'reload config';
