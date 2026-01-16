-- Add ALL missing columns to visits table based on types.ts
-- These are columns that queries use but nuclear recreate didn't include

ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS arrival_time TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS departure_time TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS results_notes TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS samples_delivered TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS products_presented TEXT[];
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS products_prescribed TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS promotional_materials TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS contact_reaction TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS doctor_interest TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS emotional_state TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS purchase_driver TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS next_commitment TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS next_steps TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS next_visit_date DATE;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS pending_followup TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS agreements TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS main_objection TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS competitor_activity TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS cycle_condition TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS detected_purchase_reason TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS closure_reason TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS closure_commitment TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS activity_performed TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS observations_feedback TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS key_contact BOOLEAN DEFAULT false;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS is_exception BOOLEAN DEFAULT false;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS out_of_range BOOLEAN DEFAULT false;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS representative TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS shelf_photo_url TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS attachments TEXT[];
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS geolocation TEXT;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS check_in_latitude NUMERIC;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS check_in_longitude NUMERIC;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS check_out_latitude NUMERIC;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS check_out_longitude NUMERIC;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS distance_meters NUMERIC;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS series_id UUID;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS directory_item_id UUID;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS interview_data JSONB;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
