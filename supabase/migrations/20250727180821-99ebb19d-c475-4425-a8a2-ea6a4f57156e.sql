-- Fix infinite recursion issue in admin_config policy
-- Create a simple function that directly checks superadmin email without using admin_config table
CREATE OR REPLACE FUNCTION public.is_superadmin_simple(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = check_user_id
    AND au.email::text = 'pagliusodiego@gmail.com'
  );
$$;

-- Update admin_config policy to use the simple function instead
DROP POLICY IF EXISTS "admin_config_superadmin_only" ON public.admin_config;

CREATE POLICY "admin_config_superadmin_only" 
ON public.admin_config 
FOR ALL 
TO authenticated
USING (is_superadmin_simple())
WITH CHECK (is_superadmin_simple());

-- Update user_roles policy to avoid recursion too
DROP POLICY IF EXISTS "user_roles_superadmin_manage" ON public.user_roles;

CREATE POLICY "user_roles_superadmin_manage" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (is_superadmin_simple())
WITH CHECK (is_superadmin_simple());