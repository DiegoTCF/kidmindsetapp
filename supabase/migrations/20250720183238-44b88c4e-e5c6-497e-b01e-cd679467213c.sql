-- Add missing UPDATE policy for progress_entries
CREATE POLICY "Parents can update their children's progress"
ON public.progress_entries
FOR UPDATE
USING (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
))
WITH CHECK (child_id IN (
  SELECT children.id
  FROM children
  WHERE children.parent_id IN (
    SELECT parents.id
    FROM parents
    WHERE parents.user_id = auth.uid()
  )
));

-- Add missing DELETE policy for progress_entries (optional, for completeness)
CREATE POLICY "Parents can delete their children's progress"
ON public.progress_entries
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

-- Create a function to get the current user's first child (for easier frontend integration)
CREATE OR REPLACE FUNCTION public.get_current_user_child_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT children.id
    FROM children
    WHERE children.parent_id IN (
      SELECT parents.id
      FROM parents
      WHERE parents.user_id = auth.uid()
    )
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_child_id() TO authenticated;