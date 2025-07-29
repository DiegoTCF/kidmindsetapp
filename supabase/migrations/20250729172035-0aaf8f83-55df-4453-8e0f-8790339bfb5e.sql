-- Create session_notes table for admin CBT notes
CREATE TABLE public.session_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  child_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  free_notes TEXT,
  trigger_situation TEXT,
  automatic_thought TEXT,
  cognitive_distortion TEXT,
  alternative_thought TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for session_notes
CREATE POLICY "session_notes_admin_only" 
ON public.session_notes 
FOR ALL 
USING (is_user_admin())
WITH CHECK (is_user_admin());

CREATE POLICY "session_notes_deny_anonymous" 
ON public.session_notes 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_session_notes_updated_at
BEFORE UPDATE ON public.session_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();