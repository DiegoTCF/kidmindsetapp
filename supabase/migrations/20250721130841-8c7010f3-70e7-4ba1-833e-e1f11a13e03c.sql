-- First, let's ensure the is_admin function is bulletproof and secure
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    WHERE (
      -- Check if specific user_id is admin
      (check_user_id IS NOT NULL AND ur.user_id = check_user_id AND ur.role = 'admin')
      OR 
      -- Check if current authenticated user is admin
      (check_user_id IS NULL AND ur.user_id = auth.uid() AND ur.role = 'admin')
      OR
      -- Hardcoded check for super admin email as fallback
      (check_user_id IS NULL AND au.email = 'pagliusodiego@gmail.com' AND au.id = auth.uid())
    )
  );
$$;

-- Ensure all critical tables have proper RLS policies
-- Let's check and fix the parents table policies
DROP POLICY IF EXISTS "Admins can view all parents" ON public.parents;
DROP POLICY IF EXISTS "Users can view their own parent record" ON public.parents;

CREATE POLICY "Admins can view all parents" 
ON public.parents 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own parent record" 
ON public.parents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure children table has proper policies
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;

CREATE POLICY "Admins can view all children" 
ON public.children 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Parents can view their own children" 
ON public.children 
FOR SELECT 
USING (parent_id IN (
  SELECT parents.id
  FROM parents
  WHERE parents.user_id = auth.uid()
));

-- Ensure activities table has proper policies
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can view their children's activities" ON public.activities;

CREATE POLICY "Admins can view all activities" 
ON public.activities 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Parents can view their children's activities" 
ON public.activities 
FOR SELECT 
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- Ensure progress_entries table has proper policies
DROP POLICY IF EXISTS "Admins can view all progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress" ON public.progress_entries;

CREATE POLICY "Admins can view all progress entries" 
ON public.progress_entries 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Parents can view their children's progress" 
ON public.progress_entries 
FOR SELECT 
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- Ensure profiles table has strict policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure super_behaviour_ratings table has proper policies
DROP POLICY IF EXISTS "Admins can view all super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can view their children's super behaviour ratings" ON public.super_behaviour_ratings;

CREATE POLICY "Admins can view all super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Parents can view their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR SELECT 
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- Make sure user_roles table is locked down completely
DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can update user roles" ON public.user_roles;

CREATE POLICY "Only admins can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Only superadmin can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE users.id = auth.uid() 
    AND users.email = 'pagliusodiego@gmail.com'
  )
);

CREATE POLICY "Only superadmin can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE users.id = auth.uid() 
    AND users.email = 'pagliusodiego@gmail.com'
  )
);

-- Test the security by creating a function that regular users should NOT be able to access
CREATE OR REPLACE FUNCTION public.test_admin_access()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
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