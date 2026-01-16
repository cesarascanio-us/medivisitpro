-- Fix for Security Advisor: "Security Definer View"
-- By default, views run with the owner's permissions (usually postgres/superuser).
-- We need to enforce RLS for the user invoking the view (`security_invoker = true`).

ALTER VIEW public.view_warehouse_stock SET (security_invoker = true);
