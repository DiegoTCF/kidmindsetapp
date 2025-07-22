-- Update test_admin_access function to fix security warning
CREATE OR REPLACE FUNCTION public.test_admin_access()
RETURNS json
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'is_admin', is_admin(),
    'user_email', (SELECT email FROM auth.users WHERE id = auth.uid()),
    'can_see_all_users', (SELECT count(*) FROM auth.users),
    'message', CASE 
      WHEN is_admin() THEN 'Admin access confirmed'
      ELSE 'Access denied - not admin'
    END
  );
$$;