-- Backend SQL Reset & Sync for Points & Level System (Part 2)

-- Step 6: Create/update reset_user_progress function for admin use
CREATE OR REPLACE FUNCTION public.reset_user_progress(target_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    child_record RECORD;
    entries_deleted INTEGER;
    reset_children_count INTEGER := 0;
    total_entries_deleted INTEGER := 0;
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
        GET DIAGNOSTICS entries_deleted = ROW_COUNT;
        total_entries_deleted := total_entries_deleted + entries_deleted;
        
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
            'progress_entries_deleted', total_entries_deleted
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