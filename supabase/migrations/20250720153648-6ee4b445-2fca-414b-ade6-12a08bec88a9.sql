-- Create policy to allow parents to delete their children's activities
CREATE POLICY "Parents can delete their children's activities" 
ON public.activities 
FOR DELETE 
USING (child_id IN ( 
  SELECT children.id
  FROM children
  WHERE (children.parent_id IN ( 
    SELECT parents.id
    FROM parents
    WHERE (parents.user_id = auth.uid())
  ))
));