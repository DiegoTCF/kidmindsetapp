-- Fix Anonymous Access Security Warnings - Add TO authenticated to all RLS policies

-- ============================================================================
-- ACTIVITIES TABLE - Fix anonymous access
-- ============================================================================

-- Drop existing policies and recreate with authenticated restriction
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can create activities for their children" ON public.activities;
DROP POLICY IF EXISTS "Parents can delete their children's activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can update their children's activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can view their children's activities" ON public.activities;

-- Recreate with authenticated restriction
CREATE POLICY "Admins can view all activities" ON public.activities
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Parents can create activities for their children" ON public.activities
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT c.id FROM children c
  JOIN parents p ON c.parent_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Parents can delete their children's activities" ON public.activities
FOR DELETE TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can update their children's activities" ON public.activities
FOR UPDATE TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can view their children's activities" ON public.activities
FOR SELECT TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- ============================================================================
-- ADMIN_NOTIFICATIONS TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.admin_notifications;

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
FOR UPDATE TO authenticated
USING (is_admin());

CREATE POLICY "Admins can view all notifications" ON public.admin_notifications
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "System can create notifications" ON public.admin_notifications
FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================================================
-- CHILDREN TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Parents can create children" ON public.children;
DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;

CREATE POLICY "Admins can view all children" ON public.children
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Parents can create children" ON public.children
FOR INSERT TO authenticated
WITH CHECK (parent_id IN (
  SELECT parents.id FROM parents
  WHERE parents.user_id = auth.uid()
));

CREATE POLICY "Parents can update their own children" ON public.children
FOR UPDATE TO authenticated
USING (parent_id IN (
  SELECT parents.id FROM parents
  WHERE parents.user_id = auth.uid()
));

CREATE POLICY "Parents can view their own children" ON public.children
FOR SELECT TO authenticated
USING (parent_id IN (
  SELECT parents.id FROM parents
  WHERE parents.user_id = auth.uid()
));

-- ============================================================================
-- DAILY_TASKS TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can update their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can view daily tasks" ON public.daily_tasks;

CREATE POLICY "Authenticated users can create their own task overrides" ON public.daily_tasks
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own task overrides" ON public.daily_tasks
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own task overrides" ON public.daily_tasks
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view daily tasks" ON public.daily_tasks
FOR SELECT TO authenticated
USING ((user_id IS NULL) OR (auth.uid() = user_id));

-- ============================================================================
-- GOALS TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can create their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can delete their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can view their own goals" ON public.goals;

CREATE POLICY "Admins can view all goals" ON public.goals
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can create their own goals" ON public.goals
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own goals" ON public.goals
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own goals" ON public.goals
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own goals" ON public.goals
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PARENTS TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all parents" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can create their own parent record" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can update their own parent record" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can view their own parent record" ON public.parents;

CREATE POLICY "Admins can view all parents" ON public.parents
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can create their own parent record" ON public.parents
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own parent record" ON public.parents
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own parent record" ON public.parents
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PROFILES TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can create their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PROGRESS_ENTRIES TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can create progress entries for their children" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can delete their children's progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can update their children's progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress" ON public.progress_entries;

CREATE POLICY "Admins can view all progress entries" ON public.progress_entries
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Parents can create progress entries for their children" ON public.progress_entries
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can delete their children's progress" ON public.progress_entries
FOR DELETE TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can update their children's progress" ON public.progress_entries
FOR UPDATE TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can view their children's progress" ON public.progress_entries
FOR SELECT TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- ============================================================================
-- SUPER_BEHAVIOUR_RATINGS TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can create super behaviour ratings for their children" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can delete their children's super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can update their children's super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can view their children's super behaviour ratings" ON public.super_behaviour_ratings;

CREATE POLICY "Admins can view all super behaviour ratings" ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Parents can create super behaviour ratings for their children" ON public.super_behaviour_ratings
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can delete their children's super behaviour ratings" ON public.super_behaviour_ratings
FOR DELETE TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can update their children's super behaviour ratings" ON public.super_behaviour_ratings
FOR UPDATE TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can view their children's super behaviour ratings" ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT parents.id FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- ============================================================================
-- USER_ACTION_LOGS TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all action logs" ON public.user_action_logs;
DROP POLICY IF EXISTS "Authenticated users can create their own action logs" ON public.user_action_logs;
DROP POLICY IF EXISTS "Authenticated users can view their own action logs" ON public.user_action_logs;

CREATE POLICY "Admins can view all action logs" ON public.user_action_logs
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Authenticated users can create their own action logs" ON public.user_action_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own action logs" ON public.user_action_logs
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- USER_ROLES TABLE - Fix anonymous access
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can update user roles" ON public.user_roles;

CREATE POLICY "Only admins can view user roles" ON public.user_roles
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Only superadmin can insert user roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM auth.users
  WHERE users.id = auth.uid() 
  AND users.email::text = 'pagliusodiego@gmail.com'::text
));

CREATE POLICY "Only superadmin can update user roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM auth.users
  WHERE users.id = auth.uid() 
  AND users.email::text = 'pagliusodiego@gmail.com'::text
));

-- ============================================================================
-- VERIFICATION: Ensure all tables have RLS enabled
-- ============================================================================

-- These should already be enabled, but ensuring consistency
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_behaviour_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;