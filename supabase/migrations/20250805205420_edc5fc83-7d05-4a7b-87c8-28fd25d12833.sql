-- Create player identity table
CREATE TABLE public.player_identity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  primary_position TEXT,
  playing_style TEXT,
  playing_characteristics TEXT,
  personality_traits TEXT[] DEFAULT '{}',
  interests_hobbies TEXT,
  core_values TEXT[] DEFAULT '{}',
  life_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.player_identity ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own identity" 
ON public.player_identity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own identity" 
ON public.player_identity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own identity" 
ON public.player_identity 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own identity" 
ON public.player_identity 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin access
CREATE POLICY "Admins can view all identities" 
ON public.player_identity 
FOR SELECT 
USING (is_user_admin());

CREATE POLICY "Admins can manage all identities" 
ON public.player_identity 
FOR ALL 
USING (is_user_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_player_identity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_player_identity_updated_at
  BEFORE UPDATE ON public.player_identity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_player_identity_updated_at();