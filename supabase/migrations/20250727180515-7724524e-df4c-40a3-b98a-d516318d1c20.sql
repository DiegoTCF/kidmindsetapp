-- Fix admin access to profiles table for user management
DROP POLICY IF EXISTS "profiles_admin_read_access" ON public.profiles;

CREATE POLICY "profiles_admin_full_access" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- Ensure admin has full access to goals table to see all player goals
DROP POLICY IF EXISTS "goals_admin_read_access" ON public.goals;

CREATE POLICY "goals_admin_full_access" 
ON public.goals 
FOR ALL 
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- Ensure admin has full access to parents table for user management
DROP POLICY IF EXISTS "parents_admin_read_access" ON public.parents;

CREATE POLICY "parents_admin_full_access" 
ON public.parents 
FOR ALL 
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());