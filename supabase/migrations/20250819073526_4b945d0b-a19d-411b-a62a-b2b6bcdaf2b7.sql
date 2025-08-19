-- Add admin access policies for player_identities table
DROP POLICY IF EXISTS "insert_own_identity" ON public.player_identities;
DROP POLICY IF EXISTS "read_own_identity" ON public.player_identities;  
DROP POLICY IF EXISTS "update_own_identity" ON public.player_identities;

-- Create new policies that allow admin access
CREATE POLICY "Users can insert their own identity" 
ON public.player_identities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert any identity" 
ON public.player_identities 
FOR INSERT 
WITH CHECK (is_user_admin());

CREATE POLICY "Users can read their own identity" 
ON public.player_identities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read any identity" 
ON public.player_identities 
FOR SELECT 
USING (is_user_admin());

CREATE POLICY "Users can update their own identity" 
ON public.player_identities 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any identity" 
ON public.player_identities 
FOR UPDATE 
USING (is_user_admin())
WITH CHECK (is_user_admin());