-- Fix function search_path for validate_webhook_url
CREATE OR REPLACE FUNCTION public.validate_webhook_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow HTTPS
  IF NEW.webhook_url !~ '^https://[^/]+' THEN
    RAISE EXCEPTION 'Webhook URL must use HTTPS protocol';
  END IF;
  
  -- Block localhost and internal IPs
  IF NEW.webhook_url ~* '(localhost|127\.0\.0\.1|169\.254\.)' THEN
    RAISE EXCEPTION 'Webhook URL cannot target internal networks';
  END IF;
  
  -- Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  IF NEW.webhook_url ~* '(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)' THEN
    RAISE EXCEPTION 'Webhook URL cannot target private networks';
  END IF;
  
  RETURN NEW;
END;
$$;