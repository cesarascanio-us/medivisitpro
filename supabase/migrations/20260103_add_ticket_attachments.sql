-- Add attachment_url to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Create storage bucket for ticket attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to ticket-attachments
CREATE POLICY "Authenticated users can upload ticket attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

-- Policy: Public/Auth users can view ticket attachments
CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ticket-attachments');
