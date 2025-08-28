-- Fix RLS policies for user_ants and player_identity_hats to support admin player view

-- Drop existing restrictive policies for user_ants
DROP POLICY IF EXISTS "deny_anonymous_ants" ON user_ants;
DROP POLICY IF EXISTS "users_own_ants" ON user_ants;

-- Create new policies for user_ants that support admin player view
CREATE POLICY "user_ants_admin_full_access" ON user_ants
FOR ALL 
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

CREATE POLICY "user_ants_user_access" ON user_ants
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Deny anonymous access to user_ants
CREATE POLICY "user_ants_deny_anonymous" ON user_ants
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Fix player_identity_hats policies to match the pattern
DROP POLICY IF EXISTS "Users can insert their own hats" ON player_identity_hats;
DROP POLICY IF EXISTS "Users can update their own hats" ON player_identity_hats;
DROP POLICY IF EXISTS "Users can view their own hats" ON player_identity_hats;

-- Create consistent policies for player_identity_hats
CREATE POLICY "player_identity_hats_admin_access" ON player_identity_hats
FOR ALL 
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

CREATE POLICY "player_identity_hats_user_access" ON player_identity_hats
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "player_identity_hats_deny_anonymous" ON player_identity_hats
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);