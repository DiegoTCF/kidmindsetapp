-- Fix points and level system

-- First, let's manually sync all child points and levels correctly
SELECT sync_child_points();

-- Check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS trigger_sync_child_points_on_progress ON progress_entries;

-- Recreate the trigger that automatically syncs points when progress entries change
CREATE TRIGGER trigger_sync_child_points_on_progress
  AFTER INSERT OR UPDATE OR DELETE ON progress_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_child_points();

-- Also ensure we have the proper initial values for all children (reset corrupted data)
UPDATE children 
SET 
  points = 0,
  level = 1
WHERE points != (
  SELECT COALESCE(SUM(points_earned), 0) 
  FROM progress_entries 
  WHERE progress_entries.child_id = children.id
);

-- Now sync everything correctly
SELECT sync_child_points();

-- Let's also add a function to reset a specific user's progress if needed
CREATE OR REPLACE FUNCTION public.reset_user_progress(target_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    child_record RECORD;
    result JSON;
BEGIN
    -- Get the user's children
    FOR child_record IN 
        SELECT c.id, c.name 
        FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = target_user_id
    LOOP
        -- Reset the child's points and level
        UPDATE children 
        SET points = 0, level = 1
        WHERE id = child_record.id;
        
        -- Delete all progress entries for this child
        DELETE FROM progress_entries WHERE child_id = child_record.id;
        
        RAISE LOG 'Reset progress for child %: %', child_record.id, child_record.name;
    END LOOP;
    
    result := json_build_object(
        'success', true,
        'message', 'User progress reset successfully'
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to reset progress: ' || SQLERRM
        );
END;
$$;