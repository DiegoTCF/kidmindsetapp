-- Fix the auth config - move pg_net extension to private schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- For activities table - recreate policies with TO authenticated
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activities;
CREATE POLICY "Admins can view all activities" 
ON public.activities
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Parents can delete their children's activities" ON public.activities;
CREATE POLICY "Parents can delete their children's activities" 
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

DROP POLICY IF EXISTS "Parents can update their children's activities" ON public.activities;
CREATE POLICY "Parents can update their children's activities" 
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

DROP POLICY IF EXISTS "Parents can view their children's activities" ON public.activities;
CREATE POLICY "Parents can view their children's activities" 
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

DROP POLICY IF EXISTS "Parents can create activities for their children" ON public.activities;
CREATE POLICY "Parents can create activities for their children" 
ON public.activities
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT c.id
  FROM (children c
    JOIN parents p ON ((c.parent_id = p.id)))
  WHERE (p.user_id = auth.uid())
));

-- For admin_notifications
DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
CREATE POLICY "Admins can update notifications" 
ON public.admin_notifications
FOR UPDATE TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can view all notifications" 
ON public.admin_notifications
FOR SELECT TO authenticated
USING (is_admin());

-- For children table
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
CREATE POLICY "Admins can view all children" 
ON public.children
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;
CREATE POLICY "Parents can update their own children" 
ON public.children
FOR UPDATE TO authenticated
USING (parent_id IN ( 
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
));

DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;
CREATE POLICY "Parents can view their own children" 
ON public.children
FOR SELECT TO authenticated
USING (parent_id IN ( 
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
));

DROP POLICY IF EXISTS "Parents can create children" ON public.children;
CREATE POLICY "Parents can create children" 
ON public.children
FOR INSERT TO authenticated
WITH CHECK (parent_id IN (
  SELECT parents.id
  FROM parents
  WHERE (parents.user_id = auth.uid())
));

-- For daily_tasks table
DROP POLICY IF EXISTS "Allow authenticated users to view daily tasks" ON public.daily_tasks;
CREATE POLICY "Allow authenticated users to view daily tasks" 
ON public.daily_tasks
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update their own task overrides" ON public.daily_tasks;
CREATE POLICY "Users can update their own task overrides" 
ON public.daily_tasks
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own task overrides" ON public.daily_tasks;
CREATE POLICY "Users can create their own task overrides" 
ON public.daily_tasks
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For parents table
DROP POLICY IF EXISTS "Admins can view all parents" ON public.parents;
CREATE POLICY "Admins can view all parents" 
ON public.parents
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own parent record" ON public.parents;
CREATE POLICY "Users can update their own parent record" 
ON public.parents
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own parent record" ON public.parents;
CREATE POLICY "Users can view their own parent record" 
ON public.parents
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own parent record" ON public.parents;
CREATE POLICY "Users can create their own parent record" 
ON public.parents
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For progress_entries table
DROP POLICY IF EXISTS "Admins can view all progress entries" ON public.progress_entries;
CREATE POLICY "Admins can view all progress entries" 
ON public.progress_entries
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Parents can delete their children's progress" ON public.progress_entries;
CREATE POLICY "Parents can delete their children's progress" 
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

DROP POLICY IF EXISTS "Parents can update their children's progress" ON public.progress_entries;
CREATE POLICY "Parents can update their children's progress" 
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

DROP POLICY IF EXISTS "Parents can view their children's progress" ON public.progress_entries;
CREATE POLICY "Parents can view their children's progress" 
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

DROP POLICY IF EXISTS "Parents can create progress entries for their children" ON public.progress_entries;
CREATE POLICY "Parents can create progress entries for their children" 
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

-- For super_behaviour_ratings table
DROP POLICY IF EXISTS "Admins can view all super behaviour ratings" ON public.super_behaviour_ratings;
CREATE POLICY "Admins can view all super behaviour ratings" 
ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Parents can delete their children's super behaviour ratings" ON public.super_behaviour_ratings;
CREATE POLICY "Parents can delete their children's super behaviour ratings" 
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

DROP POLICY IF EXISTS "Parents can update their children's super behaviour ratings" ON public.super_behaviour_ratings;
CREATE POLICY "Parents can update their children's super behaviour ratings" 
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

DROP POLICY IF EXISTS "Parents can view their children's super behaviour ratings" ON public.super_behaviour_ratings;
CREATE POLICY "Parents can view their children's super behaviour ratings" 
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

DROP POLICY IF EXISTS "Parents can create super behaviour ratings for their children" ON public.super_behaviour_ratings;
CREATE POLICY "Parents can create super behaviour ratings for their children" 
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

-- For user_action_logs table
DROP POLICY IF EXISTS "Admins can view all action logs" ON public.user_action_logs;
CREATE POLICY "Admins can view all action logs" 
ON public.user_action_logs
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own action logs" ON public.user_action_logs;
CREATE POLICY "Users can view their own action logs" 
ON public.user_action_logs
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own action logs" ON public.user_action_logs;
CREATE POLICY "Users can create their own action logs" 
ON public.user_action_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For user_roles table
DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;
CREATE POLICY "Only admins can view user roles" 
ON public.user_roles
FOR SELECT TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Only superadmin can update user roles" ON public.user_roles;
CREATE POLICY "Only superadmin can update user roles" 
ON public.user_roles
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))
));

DROP POLICY IF EXISTS "Only superadmin can insert user roles" ON public.user_roles;
CREATE POLICY "Only superadmin can insert user roles" 
ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))
));