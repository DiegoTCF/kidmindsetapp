-- COMPREHENSIVE SECURITY FIXES
-- Remove all anonymous access and implement secure RLS policies

-- First, drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "activities_admin_access" ON public.activities;
DROP POLICY IF EXISTS "activities_parent_access" ON public.activities;
DROP POLICY IF EXISTS "admin_config_superadmin_only" ON public.admin_config;
DROP POLICY IF EXISTS "admin_notifications_admin_only" ON public.admin_notifications;
DROP POLICY IF EXISTS "children_admin_access" ON public.children;
DROP POLICY IF EXISTS "children_parent_access" ON public.children;
DROP POLICY IF EXISTS "daily_tasks_user_access" ON public.daily_tasks;
DROP POLICY IF EXISTS "goals_admin_access" ON public.goals;
DROP POLICY IF EXISTS "goals_user_access" ON public.goals;
DROP POLICY IF EXISTS "parents_admin_access" ON public.parents;
DROP POLICY IF EXISTS "parents_user_access" ON public.parents;
DROP POLICY IF EXISTS "profiles_admin_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_access" ON public.profiles;
DROP POLICY IF EXISTS "progress_admin_access" ON public.progress_entries;
DROP POLICY IF EXISTS "progress_parent_access" ON public.progress_entries;
DROP POLICY IF EXISTS "behaviour_admin_access" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "behaviour_parent_access" ON public.super_behaviour_ratings;
DROP POLICY IF EXISTS "logs_admin_access" ON public.user_action_logs;
DROP POLICY IF EXISTS "logs_user_access" ON public.user_action_logs;
DROP POLICY IF EXISTS "roles_admin_access" ON public.user_roles;
DROP POLICY IF EXISTS "roles_superadmin_manage" ON public.user_roles;

-- Create secure helper function for role checking without recursion
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = check_user_id AND ur.role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users au
    LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
    WHERE au.id = check_user_id
    AND au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
  );
$$;

-- Create function to check if user owns a child
CREATE OR REPLACE FUNCTION public.user_owns_child(check_child_id uuid, check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM children c
    JOIN parents p ON c.parent_id = p.id
    WHERE c.id = check_child_id AND p.user_id = check_user_id
  );
$$;

-- DENY ALL ANONYMOUS ACCESS EXPLICITLY
-- This is critical to prevent any unintended anonymous access

-- Activities: Secure RLS policies (authenticated users only)
CREATE POLICY "activities_deny_anonymous" ON public.activities
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "activities_admin_full_access" ON public.activities
  FOR ALL TO authenticated 
  USING (is_user_admin()) 
  WITH CHECK (is_user_admin());

CREATE POLICY "activities_parent_child_access" ON public.activities
  FOR ALL TO authenticated 
  USING (user_owns_child(child_id))
  WITH CHECK (user_owns_child(child_id));

-- Admin Config: Superadmin only
CREATE POLICY "admin_config_deny_anonymous" ON public.admin_config
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "admin_config_superadmin_only" ON public.admin_config
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
      WHERE au.id = auth.uid()
      AND au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au
      LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
      WHERE au.id = auth.uid()
      AND au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
  );

-- Admin Notifications: Admin only
CREATE POLICY "admin_notifications_deny_anonymous" ON public.admin_notifications
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "admin_notifications_admin_only" ON public.admin_notifications
  FOR ALL TO authenticated 
  USING (is_user_admin())
  WITH CHECK (is_user_admin());

-- Children: Parent and admin access
CREATE POLICY "children_deny_anonymous" ON public.children
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "children_admin_access" ON public.children
  FOR ALL TO authenticated 
  USING (is_user_admin())
  WITH CHECK (is_user_admin());

CREATE POLICY "children_parent_access" ON public.children
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM parents p 
      WHERE p.id = parent_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents p 
      WHERE p.id = parent_id AND p.user_id = auth.uid()
    )
  );

-- Daily Tasks: User access only
CREATE POLICY "daily_tasks_deny_anonymous" ON public.daily_tasks
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "daily_tasks_user_access" ON public.daily_tasks
  FOR ALL TO authenticated 
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Goals: User and admin access
CREATE POLICY "goals_deny_anonymous" ON public.goals
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "goals_admin_read_access" ON public.goals
  FOR SELECT TO authenticated 
  USING (is_user_admin());

CREATE POLICY "goals_user_access" ON public.goals
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Parents: User and admin access
CREATE POLICY "parents_deny_anonymous" ON public.parents
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "parents_admin_read_access" ON public.parents
  FOR SELECT TO authenticated 
  USING (is_user_admin());

CREATE POLICY "parents_user_access" ON public.parents
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Profiles: User and admin access
CREATE POLICY "profiles_deny_anonymous" ON public.profiles
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "profiles_admin_read_access" ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_user_admin());

CREATE POLICY "profiles_user_access" ON public.profiles
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Progress Entries: Parent and admin access
CREATE POLICY "progress_entries_deny_anonymous" ON public.progress_entries
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "progress_entries_admin_access" ON public.progress_entries
  FOR ALL TO authenticated 
  USING (is_user_admin())
  WITH CHECK (is_user_admin());

CREATE POLICY "progress_entries_parent_access" ON public.progress_entries
  FOR ALL TO authenticated 
  USING (user_owns_child(child_id))
  WITH CHECK (user_owns_child(child_id));

-- Super Behaviour Ratings: Parent and admin access
CREATE POLICY "behaviour_ratings_deny_anonymous" ON public.super_behaviour_ratings
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "behaviour_ratings_admin_access" ON public.super_behaviour_ratings
  FOR ALL TO authenticated 
  USING (is_user_admin())
  WITH CHECK (is_user_admin());

CREATE POLICY "behaviour_ratings_parent_access" ON public.super_behaviour_ratings
  FOR ALL TO authenticated 
  USING (user_owns_child(child_id))
  WITH CHECK (user_owns_child(child_id));

-- User Action Logs: User and admin access
CREATE POLICY "user_logs_deny_anonymous" ON public.user_action_logs
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "user_logs_admin_read_access" ON public.user_action_logs
  FOR SELECT TO authenticated 
  USING (is_user_admin());

CREATE POLICY "user_logs_user_access" ON public.user_action_logs
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Roles: Secure role management
CREATE POLICY "user_roles_deny_anonymous" ON public.user_roles
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "user_roles_admin_read_access" ON public.user_roles
  FOR SELECT TO authenticated 
  USING (is_user_admin());

CREATE POLICY "user_roles_superadmin_manage" ON public.user_roles
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
      WHERE au.id = auth.uid()
      AND au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au
      LEFT JOIN public.admin_config ac ON ac.config_key = 'superadmin_email'
      WHERE au.id = auth.uid()
      AND au.email::text = COALESCE(ac.config_value, 'pagliusodiego@gmail.com')
    )
  );

-- Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_action_logs (
      user_id, action_type, action_details, page_location
    ) VALUES (
      auth.uid(),
      'role_granted',
      jsonb_build_object('target_user_id', NEW.user_id, 'role', NEW.role),
      'admin_panel'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_action_logs (
      user_id, action_type, action_details, page_location
    ) VALUES (
      auth.uid(),
      'role_revoked',
      jsonb_build_object('target_user_id', OLD.user_id, 'role', OLD.role),
      'admin_panel'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger for role changes
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- Update the main is_admin function to use the new secure helper
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(COALESCE(check_user_id, auth.uid()));
$$;