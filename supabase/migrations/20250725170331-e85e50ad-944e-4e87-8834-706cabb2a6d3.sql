-- Replace hardcoded superadmin email with configurable approach
-- Create admin configuration table
CREATE TABLE IF NOT EXISTS public.admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_config
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Only superadmin can manage admin config
CREATE POLICY "Only superadmin can manage admin config"
ON public.admin_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() 
    AND users.email::text = 'pagliusodiego@gmail.com'::text
  )
);

-- Insert superadmin email into config
INSERT INTO public.admin_config (config_key, config_value)
VALUES ('superadmin_email', 'pagliusodiego@gmail.com')
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

-- Update is_admin function to use config table
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
    -- Check if user is superadmin using config table
    SELECT 1 FROM auth.users au
    JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = COALESCE(check_user_id, auth.uid())
    AND au.email::text = ac.config_value
  );
$function$;

-- Update user_roles policies to use config table
DROP POLICY IF EXISTS "Only superadmin can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can update user roles" ON public.user_roles;

CREATE POLICY "Only superadmin can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.role() = 'authenticated'::text) AND 
  EXISTS (
    SELECT 1 FROM auth.users au
    JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = auth.uid()
    AND au.email::text = ac.config_value
  )
);

CREATE POLICY "Only superadmin can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  (auth.role() = 'authenticated'::text) AND 
  EXISTS (
    SELECT 1 FROM auth.users au
    JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = auth.uid()
    AND au.email::text = ac.config_value
  )
);

-- Create function to get superadmin email from config
CREATE OR REPLACE FUNCTION public.get_superadmin_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT config_value 
  FROM public.admin_config 
  WHERE config_key = 'superadmin_email'
  LIMIT 1;
$function$;