-- Create core skills evaluation table
CREATE TABLE public.core_skill_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Core Skill Ratings (1-4)
  self_worth_level INTEGER CHECK (self_worth_level >= 1 AND self_worth_level <= 4),
  goals_planning_level INTEGER CHECK (goals_planning_level >= 1 AND goals_planning_level <= 4),
  preparation_autonomy_level INTEGER CHECK (preparation_autonomy_level >= 1 AND preparation_autonomy_level <= 4),
  focus_behaviours_level INTEGER CHECK (focus_behaviours_level >= 1 AND focus_behaviours_level <= 4),
  beating_mind_level INTEGER CHECK (beating_mind_level >= 1 AND beating_mind_level <= 4),
  dealing_failure_level INTEGER CHECK (dealing_failure_level >= 1 AND dealing_failure_level <= 4),
  
  -- Optional coach notes
  coach_notes TEXT,
  
  -- Constraint to ensure only one current evaluation per child
  UNIQUE(child_id, evaluation_date)
);

-- Enable Row Level Security
ALTER TABLE public.core_skill_evaluations ENABLE ROW LEVEL SECURITY;

-- Admin can manage all evaluations
CREATE POLICY "Admins can manage all core skill evaluations"
ON public.core_skill_evaluations
FOR ALL
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to core skill evaluations"
ON public.core_skill_evaluations
FOR ALL
USING (false)
WITH CHECK (false);

-- Parents can view their child's evaluations (read-only)
CREATE POLICY "Parents can view their child's core skill evaluations"
ON public.core_skill_evaluations
FOR SELECT
USING (user_owns_child(child_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_core_skill_evaluation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_core_skill_evaluations_updated_at
BEFORE UPDATE ON public.core_skill_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_core_skill_evaluation_updated_at();