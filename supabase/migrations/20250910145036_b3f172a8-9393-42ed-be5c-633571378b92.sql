-- Create core_skills_results table for player self-assessments
CREATE TABLE public.core_skills_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Store individual skill scores as percentages
  know_who_you_are_score NUMERIC(5,2) NOT NULL,
  set_goals_score NUMERIC(5,2) NOT NULL,
  preparation_score NUMERIC(5,2) NOT NULL,
  focus_behaviours_score NUMERIC(5,2) NOT NULL,
  beating_mind_score NUMERIC(5,2) NOT NULL,
  dealing_with_failure_score NUMERIC(5,2) NOT NULL,
  
  -- Store raw answers for analysis
  raw_answers JSONB NOT NULL,
  
  -- Overall average score
  overall_score NUMERIC(5,2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.core_skills_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own results" 
ON public.core_skills_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own results" 
ON public.core_skills_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results" 
ON public.core_skills_results 
FOR SELECT 
USING (is_user_admin());

CREATE POLICY "Admins can manage all results" 
ON public.core_skills_results 
FOR ALL 
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- Create updated_at trigger
CREATE TRIGGER update_core_skills_results_updated_at
BEFORE UPDATE ON public.core_skills_results
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create index for performance
CREATE INDEX idx_core_skills_results_user_id ON public.core_skills_results(user_id);
CREATE INDEX idx_core_skills_results_created_at ON public.core_skills_results(created_at DESC);