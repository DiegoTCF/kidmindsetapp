-- Create table for detailed super behaviour ratings
CREATE TABLE public.super_behaviour_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  child_id UUID NOT NULL,
  behaviour_type TEXT NOT NULL CHECK (behaviour_type IN ('brave_off_ball', 'electric', 'aggressive')),
  
  -- Brave off the Ball questions
  question_1_rating INTEGER CHECK (question_1_rating >= 1 AND question_1_rating <= 10),
  question_2_rating INTEGER CHECK (question_2_rating >= 1 AND question_2_rating <= 10),
  question_3_rating INTEGER CHECK (question_3_rating >= 1 AND question_3_rating <= 10),
  question_4_rating INTEGER CHECK (question_4_rating >= 1 AND question_4_rating <= 10),
  
  -- Calculated average score
  average_score DECIMAL(3,1) GENERATED ALWAYS AS (
    (COALESCE(question_1_rating, 0) + COALESCE(question_2_rating, 0) + COALESCE(question_3_rating, 0) + COALESCE(question_4_rating, 0)) / 4.0
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(activity_id, behaviour_type)
);

-- Enable Row Level Security
ALTER TABLE public.super_behaviour_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Parents can create super behaviour ratings for their children" 
ON public.super_behaviour_ratings 
FOR INSERT 
WITH CHECK (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can view their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR SELECT 
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can update their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR UPDATE 
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

CREATE POLICY "Parents can delete their children's super behaviour ratings" 
ON public.super_behaviour_ratings 
FOR DELETE 
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_super_behaviour_ratings_updated_at
BEFORE UPDATE ON public.super_behaviour_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();