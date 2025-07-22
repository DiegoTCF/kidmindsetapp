-- Create extension for HTTP requests if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update RLS for anonymous users
CREATE OR REPLACE FUNCTION public.auth_or_anon()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Return true if user is authenticated OR using anonymous access
  SELECT (auth.role() = 'authenticated') OR (auth.role() = 'anon');
$$;

-- Update RLS policies to use auth_or_anon
ALTER POLICY "Admins can view all notifications" 
ON public.admin_notifications
USING (auth_or_anon() AND is_admin());