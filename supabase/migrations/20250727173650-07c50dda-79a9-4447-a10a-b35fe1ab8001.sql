-- Complete RLS Security Fix - Properly restrict all policies to authenticated users only
-- This removes all anonymous access while preserving functionality

-- First, let's ensure RLS is enabled on all tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
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

-- Remove ALL existing policies first to ensure clean state
DROP POLICY IF EXISTS "Admins can view all activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can create activities for their children" ON public.activities;
DROP POLICY IF EXISTS "Parents can delete their children's activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can update their children's activities" ON public.activities;
DROP POLICY IF EXISTS "Parents can view their children's activities" ON public.activities;

DROP POLICY IF EXISTS "Only superadmin can manage admin config" ON public.admin_config;

DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.admin_notifications;

DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Parents can create children" ON public.children;
DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;

DROP POLICY IF EXISTS "Authenticated users can create their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can update their own task overrides" ON public.daily_tasks;
DROP POLICY IF EXISTS "Authenticated users can view daily tasks" ON public.daily_tasks;

DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can create their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can delete their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can view their own goals" ON public.goals;

DROP POLICY IF EXISTS "Admins can view all parents" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can create their own parent record" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can update their own parent record" ON public.parents;
DROP POLICY IF EXISTS "Authenticated users can view their own parent record" ON public.parents;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins can view all progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can create progress entries for their children" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can delete their children's progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can update their children's progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress" ON public.progress_entries;

DROP POLICY IF EXISTS "Admins can view all super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can create super behaviour ratings for their children" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can delete their children's super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can update their children's super behaviour ratings" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "Parents can view their children's super behaviour ratings" ON public.super_behaviour_ratings;

DROP POLICY IF EXISTS "Admins can view all action logs" ON public.user_action_logs;
DROP POLICY IF EXISTS "Allow anonymous error logging" ON public.user_action_logs;
DROP POLICY IF EXISTS "Authenticated users can create their own action logs" ON public.user_action_logs;
DROP POLICY IF EXISTS "Authenticated users can view their own action logs" ON public.user_action_logs;

DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only superadmin can update user roles" ON public.user_roles;

-- Now create secure policies that explicitly restrict to authenticated users
-- Activities table policies (authenticated only)
CREATE POLICY "secure_activities_admin_select" ON public.activities
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_activities_parent_select" ON public.activities
FOR SELECT TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_activities_parent_insert" ON public.activities
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_activities_parent_update" ON public.activities
FOR UPDATE TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_activities_parent_delete" ON public.activities
FOR DELETE TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

-- Admin config (superadmin only, authenticated)
CREATE POLICY "secure_admin_config_superadmin" ON public.admin_config
FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email = 'pagliusodiego@gmail.com'
));

-- Admin notifications (authenticated only)
CREATE POLICY "secure_admin_notifications_admin_select" ON public.admin_notifications
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_admin_notifications_admin_update" ON public.admin_notifications
FOR UPDATE TO authenticated
USING (is_admin());

CREATE POLICY "secure_admin_notifications_system_insert" ON public.admin_notifications
FOR INSERT TO authenticated
WITH CHECK (true);

-- Children table (authenticated only)
CREATE POLICY "secure_children_admin_select" ON public.children
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_children_parent_select" ON public.children
FOR SELECT TO authenticated
USING (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
));

CREATE POLICY "secure_children_parent_insert" ON public.children
FOR INSERT TO authenticated
WITH CHECK (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
));

CREATE POLICY "secure_children_parent_update" ON public.children
FOR UPDATE TO authenticated
USING (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
));

-- Daily tasks (authenticated only)
CREATE POLICY "secure_daily_tasks_select" ON public.daily_tasks
FOR SELECT TO authenticated
USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "secure_daily_tasks_insert" ON public.daily_tasks
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "secure_daily_tasks_update" ON public.daily_tasks
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_daily_tasks_delete" ON public.daily_tasks
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Goals (authenticated only)
CREATE POLICY "secure_goals_admin_select" ON public.goals
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_goals_user_select" ON public.goals
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_goals_user_insert" ON public.goals
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "secure_goals_user_update" ON public.goals
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_goals_user_delete" ON public.goals
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Parents (authenticated only)
CREATE POLICY "secure_parents_admin_select" ON public.parents
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_parents_user_select" ON public.parents
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_parents_user_insert" ON public.parents
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "secure_parents_user_update" ON public.parents
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Profiles (authenticated only)
CREATE POLICY "secure_profiles_admin_select" ON public.profiles
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_profiles_user_select" ON public.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_profiles_user_insert" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "secure_profiles_user_update" ON public.profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Progress entries (authenticated only)
CREATE POLICY "secure_progress_admin_select" ON public.progress_entries
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_progress_parent_select" ON public.progress_entries
FOR SELECT TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_progress_parent_insert" ON public.progress_entries
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_progress_parent_update" ON public.progress_entries
FOR UPDATE TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_progress_parent_delete" ON public.progress_entries
FOR DELETE TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

-- Super behaviour ratings (authenticated only)
CREATE POLICY "secure_behaviour_admin_select" ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_behaviour_parent_select" ON public.super_behaviour_ratings
FOR SELECT TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_behaviour_parent_insert" ON public.super_behaviour_ratings
FOR INSERT TO authenticated
WITH CHECK (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_behaviour_parent_update" ON public.super_behaviour_ratings
FOR UPDATE TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

CREATE POLICY "secure_behaviour_parent_delete" ON public.super_behaviour_ratings
FOR DELETE TO authenticated
USING (child_id IN (
    SELECT c.id FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE p.user_id = auth.uid()
));

-- User action logs (authenticated only)
CREATE POLICY "secure_logs_admin_select" ON public.user_action_logs
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_logs_user_select" ON public.user_action_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_logs_user_insert" ON public.user_action_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- User roles (authenticated only)
CREATE POLICY "secure_roles_admin_select" ON public.user_roles
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "secure_roles_superadmin_insert" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users au
    LEFT JOIN admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = auth.uid() AND au.email = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
));

CREATE POLICY "secure_roles_superadmin_update" ON public.user_roles
FOR UPDATE TO authenticated
USING (EXISTS (
    SELECT 1 FROM auth.users au
    LEFT JOIN admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = auth.uid() AND au.email = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
));