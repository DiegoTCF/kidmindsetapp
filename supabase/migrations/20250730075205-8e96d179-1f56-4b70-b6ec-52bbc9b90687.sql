-- Backend SQL Reset & Sync for Points & Level System

-- Step 1: Run initial sync to recalculate all children's points and levels
SELECT sync_child_points();

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_child_points_on_progress ON progress_entries;

-- Step 3: Recreate the trigger with proper configuration
CREATE TRIGGER trigger_sync_child_points_on_progress
  AFTER INSERT OR UPDATE OR DELETE ON progress_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_child_points();

-- Step 4: Identify and reset children with mismatched points
-- First, let's see which children have mismatched data
DO $$
DECLARE
    child_record RECORD;
    calculated_points INTEGER;
BEGIN
    -- Loop through all children and check for mismatches
    FOR child_record IN 
        SELECT id, name, points, level FROM children
    LOOP
        -- Calculate what the points should be based on progress_entries
        SELECT COALESCE(SUM(points_earned), 0) 
        INTO calculated_points
        FROM progress_entries 
        WHERE child_id = child_record.id;
        
        -- If points don't match, reset to 0 points and level 1
        IF child_record.points != calculated_points THEN
            UPDATE children 
            SET points = 0, level = 1, updated_at = NOW()
            WHERE id = child_record.id;
            
            RAISE LOG 'Reset child % (%) - had % points, calculated %', 
                child_record.name, child_record.id, child_record.points, calculated_points;
        END IF;
    END LOOP;
END $$;

-- Step 5: Execute sync_child_points again to apply consistent recalculation
SELECT sync_child_points();

-- Step 6: Create/update reset_user_progress function for admin use
CREATE OR REPLACE FUNCTION public.reset_user_progress(target_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    child_record RECORD;
    deleted_entries_count INTEGER := 0;
    reset_children_count INTEGER := 0;
    result JSON;
BEGIN
    -- CRITICAL: Verify admin permissions
    IF NOT is_admin() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Access denied - admin privileges required'
        );
    END IF;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Get the user's children and reset their data
    FOR child_record IN 
        SELECT c.id, c.name 
        FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = target_user_id
    LOOP
        -- Delete all progress entries for this child
        DELETE FROM progress_entries WHERE child_id = child_record.id;
        GET DIAGNOSTICS deleted_entries_count = deleted_entries_count + ROW_COUNT;
        
        -- Reset the child's points and level
        UPDATE children 
        SET points = 0, level = 1, updated_at = NOW()
        WHERE id = child_record.id;
        
        reset_children_count := reset_children_count + 1;
        
        RAISE LOG 'Reset progress for child %: %', child_record.id, child_record.name;
    END LOOP;
    
    result := json_build_object(
        'success', true,
        'message', 'User progress reset successfully',
        'details', json_build_object(
            'children_reset', reset_children_count,
            'progress_entries_deleted', deleted_entries_count
        )
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

-- Step 7: Ensure all new children start with correct defaults
ALTER TABLE children 
ALTER COLUMN points SET DEFAULT 0,
ALTER COLUMN level SET DEFAULT 1;

-- Final verification: Display current state
SELECT 
    c.name,
    c.points as current_points,
    c.level as current_level,
    COALESCE(SUM(pe.points_earned), 0) as calculated_points,
    CASE 
        WHEN c.points = COALESCE(SUM(pe.points_earned), 0) THEN '✓ SYNCED'
        ELSE '✗ MISMATCH'
    END as status
FROM children c
LEFT JOIN progress_entries pe ON c.id = pe.child_id
GROUP BY c.id, c.name, c.points, c.level
ORDER BY c.points DESC;

-- Log completion
DO $$
BEGIN
    RAISE LOG 'Points & Level System Reset Complete - All triggers and functions updated';
END $$;