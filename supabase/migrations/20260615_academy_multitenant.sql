-- Migration: Make Academy tables multi-tenant

-- 1. Add organization_id to training tables
ALTER TABLE public.training_modules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.rewards_catalog ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_training_modules_org ON public.training_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_org ON public.rewards_catalog(organization_id);

-- 3. Update existing records to Biofarco organization (a0000000-0000-0000-0000-000000000001)
UPDATE public.training_modules 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid 
WHERE organization_id IS NULL;

UPDATE public.rewards_catalog 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid 
WHERE organization_id IS NULL;

-- 4. Enable RLS and Update Policies for training_modules
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view modules of their organization or global modules" ON public.training_modules;
CREATE POLICY "Users can view modules of their organization or global modules" 
ON public.training_modules FOR SELECT 
USING (
    organization_id = get_my_organization_id() 
    OR organization_id IS NULL
);

DROP POLICY IF EXISTS "Admins and managers can manage modules" ON public.training_modules;
CREATE POLICY "Admins and managers can manage modules" 
ON public.training_modules FOR ALL 
USING (
    (organization_id = get_my_organization_id()
    AND EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'gerente')
        AND organization_id = training_modules.organization_id
    ))
    OR
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'master'
    )
);

-- 5. Enable RLS and Update Policies for rewards_catalog
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view rewards of their organization" ON public.rewards_catalog;
CREATE POLICY "Users can view rewards of their organization" 
ON public.rewards_catalog FOR SELECT 
USING (
    organization_id = get_my_organization_id() 
    OR organization_id IS NULL
);

DROP POLICY IF EXISTS "Admins and managers can manage rewards" ON public.rewards_catalog;
CREATE POLICY "Admins and managers can manage rewards" 
ON public.rewards_catalog FOR ALL 
USING (
    (organization_id = get_my_organization_id()
    AND EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager', 'gerente')
        AND organization_id = rewards_catalog.organization_id
    ))
    OR
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'master'
    )
);

-- 6. Update RLS for training_lessons
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view lessons of their allowed modules" ON public.training_lessons;
CREATE POLICY "Users can view lessons of their allowed modules" 
ON public.training_lessons FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = training_lessons.module_id 
        AND (tm.organization_id = get_my_organization_id() OR tm.organization_id IS NULL)
    )
);

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.training_lessons;
CREATE POLICY "Admins can manage lessons" 
ON public.training_lessons FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = training_lessons.module_id 
        AND (
            (tm.organization_id = get_my_organization_id() AND EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.organization_id = tm.organization_id 
                AND ur.role IN ('admin', 'manager', 'gerente')
            ))
            OR
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
        )
    )
);

-- 7. Update RLS for training_exams
ALTER TABLE public.training_exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view exams of their allowed modules" ON public.training_exams;
CREATE POLICY "Users can view exams of their allowed modules" 
ON public.training_exams FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = training_exams.module_id 
        AND (tm.organization_id = get_my_organization_id() OR tm.organization_id IS NULL)
    )
);

DROP POLICY IF EXISTS "Admins can manage exams" ON public.training_exams;
CREATE POLICY "Admins can manage exams" 
ON public.training_exams FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM training_modules tm 
        WHERE tm.id = training_exams.module_id 
        AND (
            (tm.organization_id = get_my_organization_id() AND EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.organization_id = tm.organization_id 
                AND ur.role IN ('admin', 'manager', 'gerente')
            ))
            OR
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
        )
    )
);

-- 8. Update RLS for training_questions
ALTER TABLE public.training_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view questions of their allowed exams" ON public.training_questions;
CREATE POLICY "Users can view questions of their allowed exams" 
ON public.training_questions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM training_exams te
        JOIN training_modules tm ON tm.id = te.module_id
        WHERE te.id = training_questions.exam_id 
        AND (tm.organization_id = get_my_organization_id() OR tm.organization_id IS NULL)
    )
);

DROP POLICY IF EXISTS "Admins can manage questions" ON public.training_questions;
CREATE POLICY "Admins can manage questions" 
ON public.training_questions FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM training_exams te
        JOIN training_modules tm ON tm.id = te.module_id
        WHERE te.id = training_questions.exam_id 
        AND (
            (tm.organization_id = get_my_organization_id() AND EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.organization_id = tm.organization_id 
                AND ur.role IN ('admin', 'manager', 'gerente')
            ))
            OR
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
        )
    )
);
