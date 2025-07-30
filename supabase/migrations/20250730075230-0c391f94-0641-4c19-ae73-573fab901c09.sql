-- Backend SQL Reset & Sync for Points & Level System (Part 1)

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