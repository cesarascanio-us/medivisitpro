-- =================================================================================
-- MASTER FRAMEWORK - EMPRESA CA
-- Modificación: Webhook (Supabase -> n8n) para Pedidos de Transferencia (Pipeline)
-- Fecha: 2026-04-01
-- =================================================================================

-- 1. Asegurarnos que la extensión pg_net esté habilitada en Supabase
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Crear o reemplazar la función que enviará el POST a n8n
CREATE OR REPLACE FUNCTION public.notify_new_transfer_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- URL inyectada automáticamente desde n8n
  PERFORM net.http_post(
      url := 'https://n8n-catools.onrender.com/webhook-test/transfer_orders_pipeline',
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'transfer_orders',
        'record', row_to_json(NEW)
      )
  );
  RETURN NEW;
END;
$$;

-- 3. Eliminar el trigger si ya existe previamente (para re-crearlo limpio)
DROP TRIGGER IF EXISTS transfer_order_to_n8n_trigger ON public.transfer_orders;

-- 4. Enganchar la función a la tabla transfer_orders
CREATE TRIGGER transfer_order_to_n8n_trigger
  AFTER INSERT ON public.transfer_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_transfer_order();

-- Documentación Operativa:
-- Cada vez que un usuario inserte una Transfer Order en el sistema, esta capa 
-- enviará asíncronamente un Payload JSON a n8n con toda la orden dentro del campo "record".
