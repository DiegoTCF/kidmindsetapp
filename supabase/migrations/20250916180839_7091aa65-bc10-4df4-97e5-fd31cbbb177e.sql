-- Add admin permissions for best_self_reflections table
CREATE POLICY "Admins can create best self reflections for any user" 
ON best_self_reflections 
FOR INSERT 
WITH CHECK (is_user_admin());

CREATE POLICY "Admins can update best self reflections for any user" 
ON best_self_reflections 
FOR UPDATE 
USING (is_user_admin());

-- Add admin permissions for core_skills_results table  
CREATE POLICY "Admins can create core skills results for any user" 
ON core_skills_results 
FOR INSERT 
WITH CHECK (is_user_admin());