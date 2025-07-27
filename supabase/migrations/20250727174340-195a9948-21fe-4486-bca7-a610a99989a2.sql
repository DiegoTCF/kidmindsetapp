-- Final RLS Security Fix - Explicitly block anonymous and restrict to authenticated only
-- This applies the most restrictive policies to eliminate all anonymous access

-- First, disable RLS temporarily and then re-enable with strict policies
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_behaviour_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_action_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Remove all existing policies completely
DROP POLICY IF EXISTS "secure_activities_admin_select" ON public.activities;
DROP POLICY IF EXISTS "secure_activities_parent_select" ON public.activities;
DROP POLICY IF EXISTS "secure_activities_parent_insert" ON public.activities;
DROP POLICY IF EXISTS "secure_activities_parent_update" ON public.activities;
DROP POLICY IF EXISTS "secure_activities_parent_delete" ON public.activities;
DROP POLICY IF EXISTS "secure_admin_config_superadmin" ON public.admin_config;
DROP POLICY IF EXISTS "secure_admin_notifications_admin_select" ON public.admin_notifications;
DROP POLICY IF EXISTS "secure_admin_notifications_admin_update" ON public.admin_notifications;
DROP POLICY IF EXISTS "secure_admin_notifications_system_insert" ON public.admin_notifications;
DROP POLICY IF EXISTS "secure_children_admin_select" ON public.children;
DROP POLICY IF EXISTS "secure_children_parent_select" ON public.children;
DROP POLICY IF EXISTS "secure_children_parent_insert" ON public.children;
DROP POLICY IF EXISTS "secure_children_parent_update" ON public.children;
DROP POLICY IF EXISTS "secure_daily_tasks_select" ON public.daily_tasks;
DROP POLICY IF EXISTS "secure_daily_tasks_insert" ON public.daily_tasks;
DROP POLICY IF EXISTS "secure_daily_tasks_update" ON public.daily_tasks;
DROP POLICY IF EXISTS "secure_daily_tasks_delete" ON public.daily_tasks;
DROP POLICY IF EXISTS "secure_goals_admin_select" ON public.goals;
DROP POLICY IF EXISTS "secure_goals_user_select" ON public.goals;
DROP POLICY IF EXISTS "secure_goals_user_insert" ON public.goals;
DROP POLICY IF EXISTS "secure_goals_user_update" ON public.goals;
DROP POLICY IF EXISTS "secure_goals_user_delete" ON public.goals;
DROP POLICY IF EXISTS "secure_parents_admin_select" ON public.parents;
DROP POLICY IF EXISTS "secure_parents_user_select" ON public.parents;
DROP POLICY IF EXISTS "secure_parents_user_insert" ON public.parents;
DROP POLICY IF EXISTS "secure_parents_user_update" ON public.parents;
DROP POLICY IF EXISTS "secure_profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_user_select" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_user_insert" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_user_update" ON public.profiles;
DROP POLICY IF EXISTS "secure_progress_admin_select" ON public.progress_entries;
DROP POLICY IF EXISTS "secure_progress_parent_select" ON public.progress_entries;
DROP POLICY IF EXISTS "secure_progress_parent_insert" ON public.progress_entries;
DROP POLICY IF EXISTS "secure_progress_parent_update" ON public.progress_entries;
DROP POLICY IF EXISTS "secure_progress_parent_delete" ON public.progress_entries;
DROP POLICY IF EXISTS "secure_behaviour_admin_select" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "secure_behaviour_parent_select" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "secure_behaviour_parent_insert" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "secure_behaviour_parent_update" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "secure_behaviour_parent_delete" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "secure_logs_admin_select" ON public.user_action_logs;
DROP POLICY IF EXISTS "secure_logs_user_select" ON public.user_action_logs;
DROP POLICY IF EXISTS "secure_logs_user_insert" ON public.user_action_logs;
DROP POLICY IF EXISTS "secure_roles_admin_select" ON public.user_roles;
DROP POLICY IF EXISTS "secure_roles_superadmin_insert" ON public.user_roles;
DROP POLICY IF EXISTS "secure_roles_superadmin_update" ON public.user_roles;

-- Re-enable RLS on all tables
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

-- Create new ultra-secure policies that explicitly deny anonymous access
-- Activities - Only authenticated users with proper relationships
CREATE POLICY "activities_admin_access" ON public.activities
FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "activities_parent_access" ON public.activities
FOR ALL TO authenticated
USING (
    auth.uid() IS NOT NULL AND 
    child_id IN (
        SELECT c.id FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    child_id IN (
        SELECT c.id FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- Admin config - Superadmin only
CREATE POLICY "admin_config_superadmin_only" ON public.admin_config
FOR ALL TO authenticated
USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND email = 'pagliusodiego@gmail.com'
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND email = 'pagliusodiego@gmail.com'
    )
);

-- Admin notifications - Admin only
CREATE POLICY "admin_notifications_admin_only" ON public.admin_notifications
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin())
WITH CHECK (auth.uid() IS NOT NULL);

-- Children - Parents and admins only
CREATE POLICY "children_admin_access" ON public.children
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin())
WITH CHECK (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "children_parent_access" ON public.children
FOR ALL TO authenticated
USING (
    auth.uid() IS NOT NULL AND 
    parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
);

-- Daily tasks - User owned only
CREATE POLICY "daily_tasks_user_access" ON public.daily_tasks
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Goals - User owned only
CREATE POLICY "goals_admin_access" ON public.goals
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "goals_user_access" ON public.goals
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Parents - User owned only
CREATE POLICY "parents_admin_access" ON public.parents
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "parents_user_access" ON public.parents
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Profiles - User owned only
CREATE POLICY "profiles_admin_access" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "profiles_user_access" ON public.profiles
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Progress entries - Parent/child relationship only
CREATE POLICY "progress_admin_access" ON public.progress_entries
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin())
WITH CHECK (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "progress_parent_access" ON public.progress_entries
FOR ALL TO authenticated
USING (
    auth.uid() IS NOT NULL AND 
    child_id IN (
        SELECT c.id FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    child_id IN (
        SELECT c.id FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- Super behaviour ratings - Parent/child relationship only
CREATE POLICY "behaviour_admin_access" ON public.super_behaviour_ratings
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin())
WITH CHECK (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "behaviour_parent_access" ON public.super_behaviour_ratings
FOR ALL TO authenticated
USING (
    auth.uid() IS NOT NULL AND 
    child_id IN (
        SELECT c.id FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    child_id IN (
        SELECT c.id FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- User action logs - User owned or admin only
CREATE POLICY "logs_admin_access" ON public.user_action_logs
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "logs_user_access" ON public.user_action_logs
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- User roles - Admin only
CREATE POLICY "roles_admin_access" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "roles_superadmin_manage" ON public.user_roles
FOR ALL TO authenticated
USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM auth.users au
        LEFT JOIN admin_config ac ON ac.config_key = 'superadmin_email'
        WHERE au.id = auth.uid() AND au.email = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM auth.users au
        LEFT JOIN admin_config ac ON ac.config_key = 'superadmin_email'
        WHERE au.id = auth.uid() AND au.email = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
);