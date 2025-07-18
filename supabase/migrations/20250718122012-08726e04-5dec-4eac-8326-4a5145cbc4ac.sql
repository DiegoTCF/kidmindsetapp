-- Create activities table to store all custom activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Match', 'Training', '1to1', 'Futsal', 'Small Group', 'Other')),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  final_score TEXT,
  goals_scored INTEGER,
  assists_made INTEGER,
  pre_activity_completed BOOLEAN NOT NULL DEFAULT false,
  post_activity_completed BOOLEAN NOT NULL DEFAULT false,
  pre_activity_data JSONB,
  post_activity_data JSONB,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Parents can view their children's activities" 
ON public.activities 
FOR SELECT 
USING (child_id IN (
  SELECT id FROM public.children 
  WHERE parent_id IN (
    SELECT id FROM public.parents 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Parents can create activities for their children" 
ON public.activities 
FOR INSERT 
WITH CHECK (child_id IN (
  SELECT id FROM public.children 
  WHERE parent_id IN (
    SELECT id FROM public.parents 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Parents can update their children's activities" 
ON public.activities 
FOR UPDATE 
USING (child_id IN (
  SELECT id FROM public.children 
  WHERE parent_id IN (
    SELECT id FROM public.parents 
    WHERE user_id = auth.uid()
  )
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create progress tracking table
CREATE TABLE public.progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('mood', 'confidence', 'reflection', 'journal')),
  entry_value JSONB NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for progress entries
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for progress entries
CREATE POLICY "Parents can view their children's progress" 
ON public.progress_entries 
FOR SELECT 
USING (child_id IN (
  SELECT id FROM public.children 
  WHERE parent_id IN (
    SELECT id FROM public.parents 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Parents can create progress entries for their children" 
ON public.progress_entries 
FOR INSERT 
WITH CHECK (child_id IN (
  SELECT id FROM public.children 
  WHERE parent_id IN (
    SELECT id FROM public.parents 
    WHERE user_id = auth.uid()
  )
));

-- Add indexes for better performance
CREATE INDEX idx_activities_child_id ON public.activities(child_id);
CREATE INDEX idx_activities_date ON public.activities(activity_date);
CREATE INDEX idx_progress_entries_child_id ON public.progress_entries(child_id);
CREATE INDEX idx_progress_entries_date ON public.progress_entries(entry_date);