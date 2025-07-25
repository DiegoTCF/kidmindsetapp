-- Fix potential RLS policy issues that might be blocking authentication
-- Update the is_admin function with better error handling and fallback
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
      (check_user_id IS NOT NULL AND ur.user_id = check_user_id AND ur.role = 'admin')
      OR 
      (check_user_id IS NULL AND ur.user_id = auth.uid() AND ur.role = 'admin')
    )
  ) OR EXISTS (
    SELECT 1 FROM auth.users au
    LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = COALESCE(check_user_id, auth.uid())
    AND (
      au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
  );
$function$;

-- Allow anonymous error logging for troubleshooting
DROP POLICY IF EXISTS "Allow anonymous error logging" ON public.user_action_logs;
CREATE POLICY "Allow anonymous error logging"
ON public.user_action_logs
FOR INSERT
TO anon
WITH CHECK (
  action_type = 'error_occurred'
);