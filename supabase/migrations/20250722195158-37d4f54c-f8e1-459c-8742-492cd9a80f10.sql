-- Update RLS policies to restrict anonymous access
-- Create a helper function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Return true only if user is authenticated (not anonymous)
  SELECT auth.role() = 'authenticated';
$$;

-- Update all RLS policies to require authentication

-- For activities
ALTER POLICY "Admins can view all activities" 
ON public.activities
USING (is_authenticated() AND is_admin());

ALTER POLICY "Parents can delete their children's activities" 
ON public.activities
USING (is_authenticated() AND (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can update their children's activities" 
ON public.activities
USING (is_authenticated() AND (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can view their children's activities" 
ON public.activities
USING (is_authenticated() AND (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

-- For admin_notifications
ALTER POLICY "Admins can update notifications" 
ON public.admin_notifications
USING (is_authenticated() AND is_admin());

-- Replace auth_or_anon() with just is_admin()
ALTER POLICY "Admins can view all notifications" 
ON public.admin_notifications
USING (is_authenticated() AND is_admin());

-- For children table
ALTER POLICY "Admins can view all children" 
ON public.children
USING (is_authenticated() AND is_admin());

ALTER POLICY "Parents can update their own children" 
ON public.children
USING (is_authenticated() AND (parent_id IN ( 
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
)));

ALTER POLICY "Parents can view their own children" 
ON public.children
USING (is_authenticated() AND (parent_id IN ( 
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
)));

-- For daily_tasks table
ALTER POLICY "Allow authenticated users to view daily tasks" 
ON public.daily_tasks
USING (is_authenticated());

ALTER POLICY "Users can update their own task overrides" 
ON public.daily_tasks
USING (is_authenticated() AND auth.uid() = user_id);

-- For parents table
ALTER POLICY "Admins can view all parents" 
ON public.parents
USING (is_authenticated() AND is_admin());

ALTER POLICY "Users can update their own parent record" 
ON public.parents
USING (is_authenticated() AND auth.uid() = user_id);

ALTER POLICY "Users can view their own parent record" 
ON public.parents
USING (is_authenticated() AND auth.uid() = user_id);

-- For profiles table
ALTER POLICY "Admins can view all profiles" 
ON public.profiles
USING (is_authenticated() AND is_admin());

ALTER POLICY "Users can update their own profile" 
ON public.profiles
USING (is_authenticated() AND auth.uid() = user_id);

ALTER POLICY "Users can view their own profile" 
ON public.profiles
USING (is_authenticated() AND auth.uid() = user_id);

-- For progress_entries table
ALTER POLICY "Admins can view all progress entries" 
ON public.progress_entries
USING (is_authenticated() AND is_admin());

ALTER POLICY "Parents can delete their children's progress" 
ON public.progress_entries
USING (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can update their children's progress" 
ON public.progress_entries
USING (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can view their children's progress" 
ON public.progress_entries
USING (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

-- For super_behaviour_ratings table
ALTER POLICY "Admins can view all super behaviour ratings" 
ON public.super_behaviour_ratings
USING (is_authenticated() AND is_admin());

ALTER POLICY "Parents can delete their children's super behaviour ratings" 
ON public.super_behaviour_ratings
USING (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can update their children's super behaviour ratings" 
ON public.super_behaviour_ratings
USING (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can view their children's super behaviour ratings" 
ON public.super_behaviour_ratings
USING (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

-- For user_action_logs table
ALTER POLICY "Admins can view all action logs" 
ON public.user_action_logs
USING (is_authenticated() AND is_admin());

ALTER POLICY "Users can view their own action logs" 
ON public.user_action_logs
USING (is_authenticated() AND auth.uid() = user_id);

-- For user_roles table
ALTER POLICY "Only admins can view user roles" 
ON public.user_roles
USING (is_authenticated() AND is_admin());

ALTER POLICY "Only superadmin can update user roles" 
ON public.user_roles
USING (is_authenticated() AND (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))
)));

-- Also update the INSERT policies with is_authenticated()
ALTER POLICY "System can create notifications" 
ON public.admin_notifications 
FOR INSERT 
WITH CHECK (true); -- This is a special case for system-generated notifications

ALTER POLICY "Parents can create activities for their children" 
ON public.activities 
FOR INSERT 
WITH CHECK (is_authenticated() AND (child_id IN (
  SELECT c.id
  FROM (children c
    JOIN parents p ON ((c.parent_id = p.id)))
  WHERE (p.user_id = auth.uid())
)));

ALTER POLICY "Parents can create children" 
ON public.children 
FOR INSERT 
WITH CHECK (is_authenticated() AND (parent_id IN (
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
)));

ALTER POLICY "Users can create their own task overrides" 
ON public.daily_tasks 
FOR INSERT 
WITH CHECK (is_authenticated() AND auth.uid() = user_id);

ALTER POLICY "Users can create their own parent record" 
ON public.parents 
FOR INSERT 
WITH CHECK (is_authenticated() AND auth.uid() = user_id);

ALTER POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_authenticated() AND auth.uid() = user_id);

ALTER POLICY "Parents can create progress entries for their children" 
ON public.progress_entries 
FOR INSERT 
WITH CHECK (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Parents can create super behaviour ratings for their children" 
ON public.super_behaviour_ratings 
FOR INSERT 
WITH CHECK (is_authenticated() AND (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
)));

ALTER POLICY "Users can create their own action logs" 
ON public.user_action_logs 
FOR INSERT 
WITH CHECK (is_authenticated() AND auth.uid() = user_id);

ALTER POLICY "Only superadmin can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_authenticated() AND (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))
)));