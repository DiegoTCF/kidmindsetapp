-- Fix potential RLS policy issues that might be blocking authentication
-- First, let's ensure the is_admin function works correctly
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE (
      -- Check if specific user_id is admin
      (check_user_id IS NOT NULL AND ur.user_id = check_user_id AND ur.role = 'admin')
      OR 
      -- Check if current authenticated user is admin
      (check_user_id IS NULL AND ur.user_id = auth.uid() AND ur.role = 'admin')
    )
  ) OR EXISTS (
    -- Check if user is superadmin using config table with fallback
    SELECT 1 FROM auth.users au
    LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = COALESCE(check_user_id, auth.uid())
    AND (
      au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
  );
$function$;

-- Also ensure user_action_logs policies allow logging errors for troubleshooting
CREATE POLICY IF NOT EXISTS "Allow anonymous error logging"
ON public.user_action_logs
FOR INSERT
TO anon
WITH CHECK (
  action_type = 'error_occurred'
);