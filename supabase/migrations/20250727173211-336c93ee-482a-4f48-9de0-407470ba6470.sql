-- Secure RLS Fix: Remove anonymous access and restrict to authenticated users
-- This preserves all existing functionality while securing the database

-- Activities table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can view their children's activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can update their children's activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can delete their children's activities" ON public.activities;

CREATE POLICY "Admins can view all activities" 
ON public.activities 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Parents can view their children's activities" 
ON public.activities 
FOR SELECT 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

CREATE POLICY "Parents can update their children's activities" 
ON public.activities 
FOR UPDATE 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

CREATE POLICY "Parents can delete their children's activities" 
ON public.activities 
FOR DELETE 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

-- Admin config table - Fix anonymous access
DROP POLICY IF EXISTS "Only superadmin can manage admin config" ON public.admin_config;

CREATE POLICY "Only superadmin can manage admin config" 
ON public.admin_config 
FOR ALL 
TO authenticated
USING (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text = 'pagliusodiego@gmail.com'::text))));

-- Admin notifications table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;

CREATE POLICY "Admins can view all notifications" 
ON public.admin_notifications 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
TO authenticated
USING (is_admin());

-- Children table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;

CREATE POLICY "Admins can view all children" 
ON public.children 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Parents can view their own children" 
ON public.children 
FOR SELECT 
TO authenticated
USING (parent_id IN ( SELECT parents.id
   FROM parents
  WHERE (parents.user_id = auth.uid())));

CREATE POLICY "Parents can update their own children" 
ON public.children 
FOR UPDATE 
TO authenticated
USING (parent_id IN ( SELECT parents.id
   FROM parents
  WHERE (parents.user_id = auth.uid())));

-- Daily tasks table - Fix anonymous access
DROP POLICY IF EXISTS "Authenticated users can view daily tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can update their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete their own task overrides" ON public.daily_tasks;

CREATE POLICY "Authenticated users can view daily tasks" 
ON public.daily_tasks 
FOR SELECT 
TO authenticated
USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Authenticated users can update their own task overrides" 
ON public.daily_tasks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own task overrides" 
ON public.daily_tasks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Goals table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can view their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can delete their own goals" ON public.goals;

CREATE POLICY "Admins can view all goals" 
ON public.goals 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can view their own goals" 
ON public.goals 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own goals" 
ON public.goals 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own goals" 
ON public.goals 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Parents table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all parents" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can view their own parent record" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can update their own parent record" ON public.parents;

CREATE POLICY "Admins can view all parents" 
ON public.parents 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can view their own parent record" 
ON public.parents 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own parent record" 
ON public.parents 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Profiles table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Progress entries table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can update their children's progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can delete their children's progress" ON public.progress_entries;

CREATE POLICY "Admins can view all progress entries" 
ON public.progress_entries 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Parents can view their children's progress" 
ON public.progress_entries 
FOR SELECT 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

CREATE POLICY "Parents can update their children's progress" 
ON public.progress_entries 
FOR UPDATE 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

CREATE POLICY "Parents can delete their children's progress" 
ON public.progress_entries 
FOR DELETE 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

-- Super behaviour ratings table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can view their children's super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can update their children's super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can delete their children's super behaviour ratings" ON public.super_behaviour_ratings;

CREATE POLICY "Admins can view all super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Parents can view their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR SELECT 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

CREATE POLICY "Parents can update their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR UPDATE 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

CREATE POLICY "Parents can delete their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR DELETE 
TO authenticated
USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id IN ( SELECT parents.id
           FROM parents
          WHERE (parents.user_id = auth.uid())))));

-- User action logs table - Fix anonymous access
DROP POLICY IF EXISTS "Admins can view all action logs" ON public.user_action_logs;
DROP POLICY IF EXISTS "Authenticated users can view their own action logs" ON public.user_action_logs;

CREATE POLICY "Admins can view all action logs" 
ON public.user_action_logs 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can view their own action logs" 
ON public.user_action_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- User roles table - Fix anonymous access
DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can update user roles" ON public.user_roles;

CREATE POLICY "Only admins can view user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Only superadmin can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (EXISTS ( SELECT 1
   FROM (auth.users au
     LEFT JOIN admin_config ac ON ((ac.config_key = 'superadmin_email'::text)))
  WHERE ((au.id = auth.uid()) AND ((au.email)::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com'::text)))));