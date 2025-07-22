-- Create admin function to delete user and all associated data
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    parent_record RECORD;
    child_record RECORD;
    deleted_children_count INTEGER := 0;
    deleted_activities_count INTEGER := 0;
    deleted_progress_count INTEGER := 0;
    deleted_ratings_count INTEGER := 0;
    deleted_logs_count INTEGER := 0;
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

    -- Start transaction
    BEGIN
        -- Get parent record
        SELECT * INTO parent_record FROM parents WHERE user_id = target_user_id;
        
        IF FOUND THEN
            -- Delete all children and their associated data
            FOR child_record IN SELECT * FROM children WHERE parent_id = parent_record.id LOOP
                -- Delete super behaviour ratings
                DELETE FROM super_behaviour_ratings WHERE child_id = child_record.id;
                GET DIAGNOSTICS deleted_ratings_count = ROW_COUNT;
                
                -- Delete progress entries
                DELETE FROM progress_entries WHERE child_id = child_record.id;
                GET DIAGNOSTICS deleted_progress_count = ROW_COUNT;
                
                -- Delete activities
                DELETE FROM activities WHERE child_id = child_record.id;
                GET DIAGNOSTICS deleted_activities_count = ROW_COUNT;
                
                deleted_children_count := deleted_children_count + 1;
            END LOOP;
            
            -- Delete all children
            DELETE FROM children WHERE parent_id = parent_record.id;
            
            -- Delete parent record
            DELETE FROM parents WHERE user_id = target_user_id;
        END IF;
        
        -- Delete user action logs
        DELETE FROM user_action_logs WHERE user_id = target_user_id;
        GET DIAGNOSTICS deleted_logs_count = ROW_COUNT;
        
        -- Delete user roles
        DELETE FROM user_roles WHERE user_id = target_user_id;
        
        -- Delete profile
        DELETE FROM profiles WHERE user_id = target_user_id;
        
        -- Delete user-specific daily task overrides
        DELETE FROM daily_tasks WHERE user_id = target_user_id;
        
        -- Finally, delete the auth user (this must be last)
        DELETE FROM auth.users WHERE id = target_user_id;
        
        result := json_build_object(
            'success', true,
            'message', 'User deleted successfully',
            'details', json_build_object(
                'children_deleted', deleted_children_count,
                'activities_deleted', deleted_activities_count,
                'progress_entries_deleted', deleted_progress_count,
                'behaviour_ratings_deleted', deleted_ratings_count,
                'action_logs_deleted', deleted_logs_count
            )
        );
        
        RETURN result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback will happen automatically
            RETURN json_build_object(
                'success', false,
                'error', 'Failed to delete user: ' || SQLERRM
            );
    END;
END;
$$;

-- Grant execute permission to authenticated users (RLS will enforce admin check)
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

-- Create admin function to delete notification
CREATE OR REPLACE FUNCTION public.admin_delete_notification(notification_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- CRITICAL: Verify admin permissions
    IF NOT is_admin() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Access denied - admin privileges required'
        );
    END IF;

    -- Check if notification exists
    IF NOT EXISTS (SELECT 1 FROM admin_notifications WHERE id = notification_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Notification not found'
        );
    END IF;

    -- Delete the notification
    DELETE FROM admin_notifications WHERE id = notification_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Notification deleted successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to delete notification: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users (RLS will enforce admin check)
GRANT EXECUTE ON FUNCTION public.admin_delete_notification(UUID) TO authenticated;