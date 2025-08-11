-- Create table for Footballer’s Hat quiz answers
CREATE TABLE IF NOT EXISTS public.player_identity_hats (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  q4 TEXT,
  q5 TEXT,
  q6 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT player_identity_hats_pkey PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.player_identity_hats ENABLE ROW LEVEL SECURITY;

-- Policies so users can only access their own row
DROP POLICY IF EXISTS "Users can view their own hats" ON public.player_identity_hats;
CREATE POLICY "Users can view their own hats"
ON public.player_identity_hats
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own hats" ON public.player_identity_hats;
CREATE POLICY "Users can insert their own hats"
ON public.player_identity_hats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own hats" ON public.player_identity_hats;
CREATE POLICY "Users can update their own hats"
ON public.player_identity_hats
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS set_player_identity_hats_updated_at ON public.player_identity_hats;
CREATE TRIGGER set_player_identity_hats_updated_at
BEFORE UPDATE ON public.player_identity_hats
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();