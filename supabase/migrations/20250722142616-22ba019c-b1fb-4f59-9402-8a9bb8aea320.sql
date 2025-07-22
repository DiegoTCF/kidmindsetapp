-- Fix the sync_child_points function to ensure correct level calculation
-- Level 1 is starting level, then +1 level per 100 points
CREATE OR REPLACE FUNCTION public.sync_child_points(target_child_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    child_record RECORD;
    total_points INTEGER;
    calculated_level INTEGER;
BEGIN
    -- If target_child_id is provided, sync only that child
    -- Otherwise sync all children
    IF target_child_id IS NOT NULL THEN
        -- Calculate total points for the specific child
        SELECT COALESCE(SUM(points_earned), 0) INTO total_points
        FROM progress_entries
        WHERE child_id = target_child_id;
        
        -- Calculate level: Start at level 1, +1 level per 100 points
        calculated_level := 1 + (total_points / 100);
        
        -- Update the child's points
        UPDATE children 
        SET points = total_points,
            level = calculated_level,
            updated_at = NOW()
        WHERE id = target_child_id;
        
        RAISE LOG 'Synced points for child %: % points, level %', target_child_id, total_points, calculated_level;
    ELSE
        -- Sync all children
        FOR child_record IN 
            SELECT id FROM children
        LOOP
            -- Calculate total points for this child
            SELECT COALESCE(SUM(points_earned), 0) INTO total_points
            FROM progress_entries
            WHERE child_id = child_record.id;
            
            -- Calculate level: Start at level 1, +1 level per 100 points
            calculated_level := 1 + (total_points / 100);
            
            -- Update the child's points and level
            UPDATE children 
            SET points = total_points,
                level = calculated_level,
                updated_at = NOW()
            WHERE id = child_record.id;
            
            RAISE LOG 'Synced points for child %: % points, level %', child_record.id, total_points, calculated_level;
        END LOOP;
    END IF;
END;
$function$