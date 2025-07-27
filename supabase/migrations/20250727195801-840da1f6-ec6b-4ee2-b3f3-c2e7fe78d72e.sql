-- Replace existing goals table with new structure
DROP TABLE IF EXISTS goals CASCADE;

-- Create new user_goals table
CREATE TABLE user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('mindset', 'skill', 'outcome')),
  goal_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_ants table
CREATE TABLE user_ants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  core_beliefs TEXT[] NOT NULL DEFAULT '{}',
  automatic_thoughts TEXT[] NOT NULL DEFAULT '{}',
  coping_mechanisms TEXT[] NOT NULL DEFAULT '{}',
  triggers TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ants ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_goals
CREATE POLICY "users_own_goals" ON user_goals 
FOR ALL 
USING (auth.uid() = user_id OR is_user_admin());

CREATE POLICY "deny_anonymous_goals" ON user_goals 
FOR ALL 
TO anon 
USING (false);

-- RLS policies for user_ants  
CREATE POLICY "users_own_ants" ON user_ants 
FOR ALL 
USING (auth.uid() = user_id OR is_user_admin());

CREATE POLICY "deny_anonymous_ants" ON user_ants 
FOR ALL 
TO anon 
USING (false);

-- Add updated_at triggers
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON user_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ants_updated_at
BEFORE UPDATE ON user_ants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();