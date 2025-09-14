-- Create table for best self reflections
CREATE TABLE public.best_self_reflections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    ball_with_me TEXT,
    ball_without_me TEXT,
    behaviour TEXT,
    body_language TEXT,
    noticed_by_others TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for best self scores
CREATE TABLE public.best_self_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_id UUID,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.best_self_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.best_self_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for best_self_reflections
CREATE POLICY "Users can view their own best self reflections" 
ON public.best_self_reflections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own best self reflections" 
ON public.best_self_reflections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own best self reflections" 
ON public.best_self_reflections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all best self reflections" 
ON public.best_self_reflections 
FOR SELECT 
USING (is_user_admin());

-- Create policies for best_self_scores
CREATE POLICY "Users can view their own best self scores" 
ON public.best_self_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own best self scores" 
ON public.best_self_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all best self scores" 
ON public.best_self_scores 
FOR SELECT 
USING (is_user_admin());

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to best self reflections" 
ON public.best_self_reflections 
FOR ALL 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to best self scores" 
ON public.best_self_scores 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Create trigger for updated_at on best_self_reflections
CREATE TRIGGER update_best_self_reflections_updated_at
BEFORE UPDATE ON public.best_self_reflections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();