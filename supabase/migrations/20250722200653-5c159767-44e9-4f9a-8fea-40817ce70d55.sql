-- Fix the auth config - move pg_net extension to private schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update role-based RLS policies to enforce specific roles
-- Update policies to check 'authenticated' role instead of using is_authenticated()
-- For activities - specify TO authenticated in policies
ALTER POLICY "Admins can view all activities" 
ON public.activities
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Parents can delete their children's activities" 
ON public.activities
FOR DELETE TO authenticated
USING (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can update their children's activities" 
ON public.activities
FOR UPDATE TO authenticated
USING (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can view their children's activities" 
ON public.activities
FOR SELECT TO authenticated
USING (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

-- For admin_notifications
ALTER POLICY "Admins can update notifications" 
ON public.admin_notifications
FOR UPDATE TO authenticated
USING (is_admin());

ALTER POLICY "Admins can view all notifications" 
ON public.admin_notifications
FOR SELECT TO authenticated
USING (is_admin());

-- For children table
ALTER POLICY "Admins can view all children" 
ON public.children
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Parents can update their own children" 
ON public.children
FOR UPDATE TO authenticated
USING (parent_id IN ( 
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
));

ALTER POLICY "Parents can view their own children" 
ON public.children
FOR SELECT TO authenticated
USING (parent_id IN ( 
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
));

-- For daily_tasks table
ALTER POLICY "Allow authenticated users to view daily tasks" 
ON public.daily_tasks
FOR SELECT TO authenticated
USING (true);

ALTER POLICY "Users can update their own task overrides" 
ON public.daily_tasks
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- For parents table
ALTER POLICY "Admins can view all parents" 
ON public.parents
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Users can update their own parent record" 
ON public.parents
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

ALTER POLICY "Users can view their own parent record" 
ON public.parents
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- For profiles table
ALTER POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Users can update their own profile" 
ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

ALTER POLICY "Users can view their own profile" 
ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- For progress_entries table
ALTER POLICY "Admins can view all progress entries" 
ON public.progress_entries
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Parents can delete their children's progress" 
ON public.progress_entries
FOR DELETE TO authenticated
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can update their children's progress" 
ON public.progress_entries
FOR UPDATE TO authenticated
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can view their children's progress" 
ON public.progress_entries
FOR SELECT TO authenticated
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

-- For super_behaviour_ratings table
ALTER POLICY "Admins can view all super behaviour ratings" 
ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Parents can delete their children's super behaviour ratings" 
ON public.super_behaviour_ratings
FOR DELETE TO authenticated
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can update their children's super behaviour ratings" 
ON public.super_behaviour_ratings
FOR UPDATE TO authenticated
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can view their children's super behaviour ratings" 
ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

-- For user_action_logs table
ALTER POLICY "Admins can view all action logs" 
ON public.user_action_logs
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Users can view their own action logs" 
ON public.user_action_logs
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- For user_roles table
ALTER POLICY "Only admins can view user roles" 
ON public.user_roles
FOR SELECT TO authenticated
USING (is_admin());

ALTER POLICY "Only superadmin can update user roles" 
ON public.user_roles
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))
));

-- Also update the INSERT policies with TO authenticated
ALTER POLICY "System can create notifications" 
ON public.admin_notifications
FOR INSERT
WITH CHECK (true); -- Special case for system notifications

ALTER POLICY "Parents can create activities for their children" 
ON public.activities
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT c.id
  FROM (children c
    JOIN parents p ON ((c.parent_id = p.id)))
  WHERE (p.user_id = auth.uid())
));

ALTER POLICY "Parents can create children" 
ON public.children
FOR INSERT TO authenticated
WITH CHECK (parent_id IN (
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
));

ALTER POLICY "Users can create their own task overrides" 
ON public.daily_tasks
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can create their own parent record" 
ON public.parents
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can create their own profile" 
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Parents can create progress entries for their children" 
ON public.progress_entries
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Parents can create super behaviour ratings for their children" 
ON public.super_behaviour_ratings
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));

ALTER POLICY "Users can create their own action logs" 
ON public.user_action_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Only superadmin can insert user roles" 
ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))
));