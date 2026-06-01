-- ========================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Fase 5: Universidad Biofarco (E-Learning & Gamification)
-- ========================================================================

-- 1. Tabla de Módulos de Formación (Cursos)
CREATE TABLE IF NOT EXISTS public.training_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general', -- e.g., 'ventas', 'producto', 'compliance'
    required_role TEXT, -- e.g., 'rep', 'manager'
    points_reward INTEGER DEFAULT 100,
    status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Lecciones (Contenido multimedia de cada módulo)
CREATE TABLE IF NOT EXISTS public.training_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Exámenes
CREATE TABLE IF NOT EXISTS public.training_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    passing_score_percentage INTEGER DEFAULT 80,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla de Preguntas del Examen
CREATE TABLE IF NOT EXISTS public.training_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.training_exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings: ["Opción A", "Opción B", "Opción C"]
    correct_option_index INTEGER NOT NULL,
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0
);

-- 5. Tabla de Progreso y Calificaciones del Usuario
CREATE TABLE IF NOT EXISTS public.user_training_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    best_score_percentage INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, module_id)
);

-- 6. Catálogo de Premios (Tienda de Puntos)
CREATE TABLE IF NOT EXISTS public.rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'out_of_stock', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Historial de Canjes (Redemptions)
CREATE TABLE IF NOT EXISTS public.user_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards_catalog(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'delivered', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- 8. Alterar la vista y tabla de roles/profiles para rastrear los puntos totales
-- Asumiendo que usamos 'user_roles' o 'profiles'. Usaremos un enfoque de balance calculado
-- Pero para caché rápido, añadiremos 'total_points' a 'user_roles_plain' o 'profiles' si existe.
-- Verificamos si podemos añadirla a 'profiles'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
    END IF;
END $$;


-- ========================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================================================

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura (Cualquier usuario autenticado puede leer el catálogo de cursos y premios)
CREATE POLICY "Lectura Módulos" ON public.training_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura Lecciones" ON public.training_lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura Exámenes" ON public.training_exams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura Preguntas" ON public.training_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Lectura Catálogo Premios" ON public.rewards_catalog FOR SELECT USING (auth.role() = 'authenticated');

-- Progreso de entrenamiento: El usuario lee el suyo, Managers leen todo
CREATE POLICY "Usuario lee su propio progreso" ON public.user_training_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuario actualiza su propio progreso" ON public.user_training_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuario inserta su propio progreso" ON public.user_training_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Canjes de premios: Usuario inserta y lee los suyos
CREATE POLICY "Usuario lee sus canjes" ON public.user_reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuario inserta sus canjes" ON public.user_reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ========================================================================
-- DATOS DE PRUEBA (SEED DATA)
-- ========================================================================

-- Insertar Módulo de Prueba
INSERT INTO public.training_modules (id, title, description, category, points_reward)
VALUES 
('d5084920-5c30-4e76-8f3e-5b128c704f01', 'Masterclass: Técnicas de Cierre Efectivo', 'Aprende a cerrar la visita médica con compromisos reales de prescripción.', 'ventas', 150),
('d5084920-5c30-4e76-8f3e-5b128c704f02', 'Actualización Médica: Acetafen Forte', 'Revisión de las últimas indicaciones y ventajas competitivas de Acetafen Forte.', 'producto', 100)
ON CONFLICT DO NOTHING;

-- Insertar Lecciones
INSERT INTO public.training_lessons (module_id, title, content, video_url, order_index)
VALUES 
('d5084920-5c30-4e76-8f3e-5b128c704f01', 'Introducción al Cierre', 'El cierre no es presionar, es guiar al médico a una decisión lógica basada en la evidencia presentada.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
('d5084920-5c30-4e76-8f3e-5b128c704f02', 'Farmacocinética Avanzada', 'Acetafen Forte ofrece una absorción un 30% más rápida que la competencia.', NULL, 1);

-- Insertar Examen
INSERT INTO public.training_exams (id, module_id, title, passing_score_percentage, max_attempts)
VALUES 
('e5084920-5c30-4e76-8f3e-5b128c704f01', 'd5084920-5c30-4e76-8f3e-5b128c704f01', 'Examen de Certificación: Cierre', 100, 3),
('e5084920-5c30-4e76-8f3e-5b128c704f02', 'd5084920-5c30-4e76-8f3e-5b128c704f02', 'Evaluación: Acetafen Forte', 80, 5)
ON CONFLICT DO NOTHING;

-- Insertar Preguntas
INSERT INTO public.training_questions (exam_id, question_text, options, correct_option_index)
VALUES 
('e5084920-5c30-4e76-8f3e-5b128c704f01', '¿Cuál es el principal objetivo del cierre en la visita médica?', '["Dejar muestras", "Obtener un compromiso de prescripción", "Solo informar"]', 1),
('e5084920-5c30-4e76-8f3e-5b128c704f02', '¿Cuál es la ventaja de absorción de Acetafen Forte?', '["10% más rápida", "Igual a la competencia", "30% más rápida"]', 2);

-- Insertar Premios en el Catálogo
INSERT INTO public.rewards_catalog (name, description, points_cost, stock, image_url)
VALUES 
('Tarjeta de Regalo Amazon $50', 'Canjea tus puntos por una Gift Card digital de Amazon de $50 dólares.', 500, 10, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=400'),
('Día Libre Remunerado', 'Gánate un día de descanso extra este mes por tu excelencia académica.', 1000, 5, 'https://images.unsplash.com/photo-1540316279644-846358c2780e?auto=format&fit=crop&q=80&w=400'),
('Kit Corporativo Premium', 'Incluye Termo Yeti grabado, Bolígrafo Parker y Libreta de cuero Biofarco.', 300, 20, 'https://images.unsplash.com/photo-1583574880922-a74c2ea233b8?auto=format&fit=crop&q=80&w=400');
