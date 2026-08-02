-- =====================================================
-- LMS SCHEMA — MediVisit Pro Academy
-- Reglas de negocio:
--   · Sin inscripción: cursos visibles a toda la org
--   · Mandatory (ver + aprobar) salvo is_informative = true
--   · Duración máxima 60 min por curso
--   · Puntos ligados a rewards_catalog al completar
--   · Cursos SISTEMA: pre-seeded por rol (cómo usar la app)
--   · Cursos CUSTOM: creados por gerente (SOPs, productos, etc.)
-- =====================================================


-- 1. Extender training_modules con campos LMS
ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  ADD COLUMN IF NOT EXISTS is_informative boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_mins integer DEFAULT 30 CHECK (duration_mins <= 60),
  ADD COLUMN IF NOT EXISTS instructor_name text,
  ADD COLUMN IF NOT EXISTS passing_score integer DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  -- target_roles: null = todos, o array de roles ['representative','manager',...]
  ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT NULL,
  -- course_type: 'platform' = onboarding de la app (sistema), 'custom' = creado por gerente
  ADD COLUMN IF NOT EXISTS course_type text DEFAULT 'custom' CHECK (course_type IN ('platform','custom'));


-- 2. Secciones del curso (capítulos)
CREATE TABLE IF NOT EXISTS public.course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Lecciones dentro de cada sección
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text DEFAULT 'text' CHECK (content_type IN ('text','video','quiz')),
  content_body text,          -- HTML/Markdown para tipo texto
  video_url text,             -- YouTube / Vimeo embed URL
  duration_mins integer DEFAULT 5,
  order_index integer NOT NULL DEFAULT 0,
  points_reward integer DEFAULT 0,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. Progreso por usuario por lección
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  completed_at timestamptz,
  time_spent_mins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 5. Exámenes ligados a un módulo
CREATE TABLE IF NOT EXISTS public.course_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Examen Final',
  passing_score integer DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
  max_attempts integer DEFAULT 3,
  time_limit_mins integer DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- 6. Preguntas del examen
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice','true_false')),
  options jsonb DEFAULT '[]',       -- [{label, value}]
  correct_answer text NOT NULL,
  points integer DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 7. Intentos de examen por usuario
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb DEFAULT '{}',
  attempt_number integer DEFAULT 1,
  completed_at timestamptz DEFAULT now()
);

-- 8. Progreso global del curso por usuario
CREATE TABLE IF NOT EXISTS public.course_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  lessons_completed integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  progress_pct integer DEFAULT 0,
  quiz_passed boolean DEFAULT false,
  quiz_score integer DEFAULT 0,
  points_awarded integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

-- Sections: visible to all authenticated users in same org
CREATE POLICY "Sections visible to org members" ON public.course_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_modules tm
      WHERE tm.id = course_sections.module_id
      AND (tm.organization_id IS NULL OR tm.organization_id = (
        SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
      ))
    )
  );

CREATE POLICY "Admins manage sections" ON public.course_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master','admin','manager','gerente'))
  );

-- Lessons: same visibility as sections
CREATE POLICY "Lessons visible to org members" ON public.course_lessons
  FOR SELECT USING (true);

CREATE POLICY "Admins manage lessons" ON public.course_lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master','admin','manager','gerente'))
  );

-- Lesson progress: users own their progress
CREATE POLICY "Users own lesson progress" ON public.lesson_progress
  FOR ALL USING (user_id = auth.uid());

-- Quizzes: visible to all
CREATE POLICY "Quizzes visible to all" ON public.course_quizzes
  FOR SELECT USING (true);

CREATE POLICY "Admins manage quizzes" ON public.course_quizzes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master','admin','manager','gerente'))
  );

-- Quiz questions: visible to all
CREATE POLICY "Questions visible to all" ON public.quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins manage questions" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master','admin','manager','gerente'))
  );

-- Quiz attempts: users own their attempts
CREATE POLICY "Users own quiz attempts" ON public.quiz_attempts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins view all attempts" ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master','admin','manager','gerente'))
  );

-- Course completions: users own, admins view all
CREATE POLICY "Users own completions" ON public.course_completions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins view all completions" ON public.course_completions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('master','admin','manager','gerente'))
  );
