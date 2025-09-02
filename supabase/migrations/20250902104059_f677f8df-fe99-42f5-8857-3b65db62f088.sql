-- Fix admin_delete_user to handle orphaned profiles (users that exist in profiles but not in auth.users)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    result JSON;
    parent_record RECORD;
    child_record RECORD;
    deleted_children_count INTEGER := 0;
    deleted_activities_count INTEGER := 0;
    deleted_progress_count INTEGER := 0;
    deleted_ratings_count INTEGER := 0;
    deleted_logs_count INTEGER := 0;
    current_user_id UUID;
    user_exists_in_auth BOOLEAN := false;
    user_exists_in_profiles BOOLEAN := false;
BEGIN
    -- Get the current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- CRITICAL: Verify admin permissions with explicit user ID
    IF NOT is_user_admin(current_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Access denied - admin privileges required',
            'debug_info', json_build_object(
                'current_user_id', current_user_id,
                'is_admin', is_user_admin(current_user_id),
                'target_user_id', target_user_id
            )
        );
    END IF;

    -- Check if user exists in auth.users
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_exists_in_auth;
    
    -- Check if user exists in profiles (orphaned data)
    SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = target_user_id) INTO user_exists_in_profiles;

    -- If user doesn't exist in either auth.users or profiles, return error
    IF NOT user_exists_in_auth AND NOT user_exists_in_profiles THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found in any table'
        );
    END IF;

    -- Start transaction to clean up all data
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
        
        -- Delete profile (always delete this, even if orphaned)
        DELETE FROM profiles WHERE user_id = target_user_id;
        
        -- Delete user-specific daily task overrides
        DELETE FROM daily_tasks WHERE user_id = target_user_id;
        
        -- Delete from auth.users only if it exists
        IF user_exists_in_auth THEN
            DELETE FROM auth.users WHERE id = target_user_id;
        END IF;
        
        result := json_build_object(
            'success', true,
            'message', CASE 
                WHEN user_exists_in_auth THEN 'User deleted successfully'
                ELSE 'Orphaned user data cleaned up successfully'
            END,
            'details', json_build_object(
                'children_deleted', deleted_children_count,
                'activities_deleted', deleted_activities_count,
                'progress_entries_deleted', deleted_progress_count,
                'behaviour_ratings_deleted', deleted_ratings_count,
                'action_logs_deleted', deleted_logs_count,
                'was_orphaned', NOT user_exists_in_auth
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
$function$;