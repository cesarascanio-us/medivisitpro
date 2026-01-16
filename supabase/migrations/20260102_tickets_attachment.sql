-- Add attachment_url column
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS attachment_url text;

-- Create Storage Bucket 'ticket-attachments'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Allow anyone authenticated to upload
CREATE POLICY "Authenticated users can upload tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

-- Allow anyone authenticated to view (simplification, ideally owner or master only)
CREATE POLICY "Authenticated users can view tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ticket-attachments');
