-- Script para crear la tabla de 'objectives' (Metas Comerciales)
CREATE TABLE IF NOT EXISTS public.objectives (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  organization_id uuid,
  user_id uuid NOT NULL,
  title text NOT NULL,
  target_value numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  category text NOT NULL CHECK (category IN ('visits', 'sales', 'samples')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT objectives_pkey PRIMARY KEY (id),
  CONSTRAINT objectives_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT objectives_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT objectives_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Enable RLS
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

-- Policy: Select (Users can see objectives from their organization)
CREATE POLICY "Users can view objectives in their organization" ON public.objectives
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Insert (Users can insert their own objectives or managers can insert for their org)
CREATE POLICY "Users can insert objectives in their organization" ON public.objectives
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Update (Users can update their own objectives)
CREATE POLICY "Users can update objectives in their organization" ON public.objectives
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Delete (Users can delete their own objectives)
CREATE POLICY "Users can delete objectives in their organization" ON public.objectives
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Grant privileges
GRANT ALL ON public.objectives TO authenticated;
GRANT ALL ON public.objectives TO service_role;
