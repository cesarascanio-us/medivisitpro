-- Create health_centers table
CREATE TABLE public.health_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  type TEXT, -- hospital, clinic, medical_center, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_centers ENABLE ROW LEVEL SECURITY;

-- Create policies for health_centers
CREATE POLICY "Users can view their own health centers"
ON public.health_centers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health centers"
ON public.health_centers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health centers"
ON public.health_centers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health centers"
ON public.health_centers
FOR DELETE
USING (auth.uid() = user_id);

-- Create junction table for many-to-many relationship between contacts (doctors) and health_centers
CREATE TABLE public.contact_health_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  health_center_id UUID NOT NULL REFERENCES public.health_centers(id) ON DELETE CASCADE,
  schedule TEXT, -- e.g., "Lunes y Miércoles 9:00-13:00"
  is_primary BOOLEAN DEFAULT false, -- to mark the main health center
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, health_center_id)
);

-- Enable RLS
ALTER TABLE public.contact_health_centers ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_health_centers
CREATE POLICY "Users can view their own contact health centers"
ON public.contact_health_centers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.contacts
  WHERE contacts.id = contact_health_centers.contact_id
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can create their own contact health centers"
ON public.contact_health_centers
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.contacts
  WHERE contacts.id = contact_health_centers.contact_id
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can update their own contact health centers"
ON public.contact_health_centers
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.contacts
  WHERE contacts.id = contact_health_centers.contact_id
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own contact health centers"
ON public.contact_health_centers
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.contacts
  WHERE contacts.id = contact_health_centers.contact_id
  AND contacts.user_id = auth.uid()
));

-- Add trigger for health_centers updated_at
CREATE TRIGGER update_health_centers_updated_at
BEFORE UPDATE ON public.health_centers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();