-- Create mindset_reflections_test table
CREATE TABLE public.mindset_reflections_test (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL,
    question_key TEXT NOT NULL,
    selected_option TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mindset_reflections_test ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Child can access their own reflections"
ON public.mindset_reflections_test
FOR ALL
USING (child_id = get_current_user_child_id());

CREATE POLICY "Admin can read all reflections"
ON public.mindset_reflections_test
FOR SELECT
USING (is_admin());

CREATE POLICY "Deny anonymous access to mindset reflections"
ON public.mindset_reflections_test
FOR ALL
USING (false)
WITH CHECK (false);