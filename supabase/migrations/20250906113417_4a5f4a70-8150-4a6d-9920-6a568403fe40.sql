-- Create core_skills_assessments table
CREATE TABLE public.core_skills_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  skill_1_score FLOAT NOT NULL, -- Know Who You Are (Self-Worth)
  skill_2_score FLOAT NOT NULL, -- Set Goals / Have a Plan
  skill_3_score FLOAT NOT NULL, -- Preparation / Autonomy / Habits
  skill_4_score FLOAT NOT NULL, -- Focus on Super Behaviours
  skill_5_score FLOAT NOT NULL, -- Beating Your Mind (ANTs / Thinking Traps)
  skill_6_score FLOAT NOT NULL, -- Dealing with Failure & Challenges
  raw_answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.core_skills_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage all assessments" 
ON public.core_skills_assessments 
FOR ALL 
USING (is_user_admin());

CREATE POLICY "Parents can view their child's assessments" 
ON public.core_skills_assessments 
FOR SELECT 
USING (user_owns_child(child_id));

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to assessments" 
ON public.core_skills_assessments 
FOR ALL 
USING (false);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_core_skills_assessments_updated_at
BEFORE UPDATE ON public.core_skills_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();