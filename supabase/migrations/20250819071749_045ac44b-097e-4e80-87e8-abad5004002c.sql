-- Create child_goals table for managing child-specific goals
CREATE TABLE public.child_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  goal_type TEXT NOT NULL,
  goal_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.child_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_can_manage_child_goals" 
ON public.child_goals 
FOR ALL 
USING (user_owns_child(child_id))
WITH CHECK (user_owns_child(child_id));

CREATE POLICY "admins_can_manage_all_child_goals" 
ON public.child_goals 
FOR ALL 
USING (is_user_admin())
WITH CHECK (is_user_admin());

CREATE POLICY "deny_anonymous_access_to_child_goals" 
ON public.child_goals 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER update_child_goals_updated_at
BEFORE UPDATE ON public.child_goals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();