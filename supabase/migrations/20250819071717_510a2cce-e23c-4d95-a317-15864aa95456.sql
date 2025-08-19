-- Fix RLS policy for user_goals to allow admin access for children
-- Drop existing policies
DROP POLICY IF EXISTS "users_own_goals" ON public.user_goals;
DROP POLICY IF EXISTS "deny_anonymous_goals" ON public.user_goals;

-- Create new policies that properly handle admin access to child data
CREATE POLICY "users_can_manage_own_goals" 
ON public.user_goals 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_can_manage_all_goals" 
ON public.user_goals 
FOR ALL 
USING (is_user_admin())
WITH CHECK (is_user_admin());

CREATE POLICY "deny_anonymous_access_to_goals" 
ON public.user_goals 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');