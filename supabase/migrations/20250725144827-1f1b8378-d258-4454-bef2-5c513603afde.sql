-- CRITICAL SECURITY FIXES

-- 1. Remove hardcoded superadmin email from is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE (
      -- Check if specific user_id is admin
      (check_user_id IS NOT NULL AND ur.user_id = check_user_id AND ur.role = 'admin')
      OR 
      -- Check if current authenticated user is admin
      (check_user_id IS NULL AND ur.user_id = auth.uid() AND ur.role = 'admin')
    )
  );
$function$;

-- 2. Fix RLS policies to remove anonymous access to sensitive data

-- Update goals policies to require authentication
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Authenticated users can view their own goals" 
ON public.goals 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own goals" ON public.goals;
CREATE POLICY "Authenticated users can create their own goals" 
ON public.goals 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "Authenticated users can update their own goals" 
ON public.goals 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "Authenticated users can delete their own goals" 
ON public.goals 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Update daily_tasks policies to require authentication for user-specific tasks
DROP POLICY IF EXISTS "Allow authenticated users to view daily tasks" ON public.daily_tasks;
CREATE POLICY "Authenticated users can view daily tasks" 
ON public.daily_tasks 
FOR SELECT 
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own task overrides" ON public.daily_tasks;
CREATE POLICY "Authenticated users can create their own task overrides" 
ON public.daily_tasks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own task overrides" ON public.daily_tasks;
CREATE POLICY "Authenticated users can update their own task overrides" 
ON public.daily_tasks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own task overrides" ON public.daily_tasks;
CREATE POLICY "Authenticated users can delete their own task overrides" 
ON public.daily_tasks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Update profiles policies to require authentication
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Update parents policies to require authentication
DROP POLICY IF EXISTS "Users can view their own parent record" ON public.parents;
CREATE POLICY "Authenticated users can view their own parent record" 
ON public.parents 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own parent record" ON public.parents;
CREATE POLICY "Authenticated users can create their own parent record" 
ON public.parents 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own parent record" ON public.parents;
CREATE POLICY "Authenticated users can update their own parent record" 
ON public.parents 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Update user_action_logs policies to require authentication
DROP POLICY IF EXISTS "Users can view their own action logs" ON public.user_action_logs;
CREATE POLICY "Authenticated users can view their own action logs" 
ON public.user_action_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own action logs" ON public.user_action_logs;
CREATE POLICY "Authenticated users can create their own action logs" 
ON public.user_action_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);