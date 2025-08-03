-- Create a function to get all users for admin access
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only allow admin users to access this function
  SELECT au.id, au.email, au.created_at
  FROM auth.users au
  WHERE public.is_user_admin(auth.uid());
$$;