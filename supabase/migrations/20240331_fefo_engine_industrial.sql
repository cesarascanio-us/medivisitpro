-- industrialize_fefo_engine.sql
-- AUTOMATIZED FEFO ALERT ENGINE
-- PURPOSE: Move from frontend-only calculation to a proactive backend notification system.

-- 1. Ensure notifications table exists (standard structure)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.organizations(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'fefo_alert', 'inventory_low', etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. THE FEFO SCANNER FUNCTION
-- This function identifies samples/products nearing expiration (threshold: 30 days)
-- and creates notifications for relevant personnel.
CREATE OR REPLACE FUNCTION public.run_fefo_inventory_scan()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
    v_recipient RECORD;
    v_threshold_days INTEGER := 30;
BEGIN
    -- Loop through batch/lot stocks nearing expiration
    FOR v_record IN 
        SELECT 
            s.id,
            s.product_id,
            p.name as product_name,
            s.batch_number,
            s.expiration_date,
            s.organization_id,
            (s.expiration_date - CURRENT_DATE) as days_left
        FROM public.sample_inventory s
        JOIN public.products p ON s.product_id = p.id
        WHERE s.expiration_date <= (CURRENT_DATE + v_threshold_days)
          AND s.expiration_date > CURRENT_DATE -- Not already expired (handle separately)
          AND s.quantity > 0
    LOOP
        -- Notify Admin and Managers of the specific organization
        FOR v_recipient IN 
            SELECT user_id 
            FROM public.user_roles 
            WHERE organization_id = v_record.organization_id 
              AND role IN ('admin', 'manager')
        LOOP
            -- Create notification if it hasn't been created in the last 24h for this batch
            INSERT INTO public.notifications (
                user_id,
                organization_id,
                title,
                message,
                type,
                metadata
            )
            SELECT 
                v_recipient.user_id,
                v_record.organization_id,
                'Alerta FEFO: Vencimiento Próximo',
                format('El lote %s del producto %s vencerá en %s días. Acceda al módulo FEFO para planificar su distribución.', 
                    v_record.batch_number, v_record.product_name, v_record.days_left),
                'fefo_alert',
                jsonb_build_object('product_id', v_record.product_id, 'batch', v_record.batch_number, 'days_left', v_record.days_left)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.notifications 
                WHERE user_id = v_recipient.user_id 
                  AND metadata->>'batch' = v_record.batch_number
                  AND created_at > (NOW() - INTERVAL '24 hours')
            );
        END LOOP;
    END LOOP;
END;
$$;

-- 3. SCHEDULE THE SCAN (Needs pg_cron extension active in Supabase)
-- If pg_cron is not available, this should be called via Supabase Edge Function cron.
-- SELECT cron.schedule('fefo-daily-scan', '0 6 * * *', 'SELECT public.run_fefo_inventory_scan()');

COMMENT ON FUNCTION public.run_fefo_inventory_scan IS 'Daily proactive scan for expiring inventory. Threshold: 30 days. Auto-notifies Admins/Managers.';
