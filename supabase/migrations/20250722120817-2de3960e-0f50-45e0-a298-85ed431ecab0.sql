-- Create function to sync child points from progress_entries
CREATE OR REPLACE FUNCTION public.sync_child_points(target_child_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    child_record RECORD;
    total_points INTEGER;
BEGIN
    -- If target_child_id is provided, sync only that child
    -- Otherwise sync all children
    IF target_child_id IS NOT NULL THEN
        -- Calculate total points for the specific child
        SELECT COALESCE(SUM(points_earned), 0) INTO total_points
        FROM progress_entries
        WHERE child_id = target_child_id;
        
        -- Update the child's points
        UPDATE children 
        SET points = total_points,
            level = GREATEST(1, (total_points / 100) + 1),
            updated_at = NOW()
        WHERE id = target_child_id;
        
        RAISE LOG 'Synced points for child %: % points, level %', target_child_id, total_points, GREATEST(1, (total_points / 100) + 1);
    ELSE
        -- Sync all children
        FOR child_record IN 
            SELECT id FROM children
        LOOP
            -- Calculate total points for this child
            SELECT COALESCE(SUM(points_earned), 0) INTO total_points
            FROM progress_entries
            WHERE child_id = child_record.id;
            
            -- Update the child's points and level
            UPDATE children 
            SET points = total_points,
                level = GREATEST(1, (total_points / 100) + 1),
                updated_at = NOW()
            WHERE id = child_record.id;
            
            RAISE LOG 'Synced points for child %: % points, level %', child_record.id, total_points, GREATEST(1, (total_points / 100) + 1);
        END LOOP;
    END IF;
END;
$$;

-- Create trigger function to automatically sync points when progress_entries change
CREATE OR REPLACE FUNCTION public.trigger_sync_child_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Sync points for the affected child
    IF TG_OP = 'DELETE' THEN
        PERFORM public.sync_child_points(OLD.child_id);
        RETURN OLD;
    ELSE
        PERFORM public.sync_child_points(NEW.child_id);
        RETURN NEW;
    END IF;
END;
$$;

-- Create trigger to automatically sync child points when progress_entries are modified
DROP TRIGGER IF EXISTS sync_child_points_trigger ON progress_entries;
CREATE TRIGGER sync_child_points_trigger
    AFTER INSERT OR UPDATE OR DELETE ON progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_sync_child_points();

-- Function to get current user's child with fresh data
CREATE OR REPLACE FUNCTION public.get_current_user_child_data()
RETURNS TABLE (
    child_id UUID,
    child_name TEXT,
    child_level INTEGER,
    child_points INTEGER,
    weekly_mood_avg NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    target_child_id UUID;
    mood_avg NUMERIC;
BEGIN
    -- Get current user's child ID
    SELECT get_current_user_child_id() INTO target_child_id;
    
    IF target_child_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate weekly mood average
    SELECT AVG(CAST(entry_value AS INTEGER))
    FROM progress_entries pe
    WHERE pe.child_id = target_child_id
      AND pe.entry_type = 'mood'
      AND pe.entry_date >= CURRENT_DATE - INTERVAL '7 days'
    INTO mood_avg;
    
    -- Return child data with computed values
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.level,
        c.points,
        COALESCE(mood_avg, 3.5)
    FROM children c
    WHERE c.id = target_child_id;
END;
$$;

-- Sync all existing children points based on progress_entries
SELECT public.sync_child_points();