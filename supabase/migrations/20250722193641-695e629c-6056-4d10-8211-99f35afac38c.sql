-- Update the notification triggers to also send email notifications
CREATE OR REPLACE FUNCTION public.handle_new_user_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Add admin notification
    PERFORM public.add_admin_notification(
        'user_signup',
        'New User Signup',
        'A new user has signed up: ' || NEW.email,
        NEW.id,
        NEW.email
    );
    
    -- Send email notification (async)
    PERFORM net.http_post(
        url := 'https://wipmfpcxquwrjszigwac.supabase.co/functions/v1/send-admin-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcG1mcGN4cXV3cmpzemlnd2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzMyMjAsImV4cCI6MjA2ODQwOTIyMH0.pyQ0UcR_sNz9X8TkLqnshwTaMbfgBNxgD5f-ViVcpn0"}'::jsonb,
        body := json_build_object(
            'notification_type', 'user_signup',
            'user_email', NEW.email,
            'timestamp', now()
        )::jsonb
    );
    
    RETURN NEW;
END;
$$;

-- Update the activity notification function
CREATE OR REPLACE FUNCTION public.handle_new_activity_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    child_name TEXT;
    parent_email TEXT;
BEGIN
    -- Get child name
    SELECT c.name INTO child_name
    FROM children c
    WHERE c.id = NEW.child_id;
    
    -- Get parent email through the relationship
    SELECT au.email INTO parent_email
    FROM children c
    JOIN parents p ON c.parent_id = p.id
    JOIN auth.users au ON p.user_id = au.id
    WHERE c.id = NEW.child_id;
    
    -- Add admin notification
    PERFORM public.add_admin_notification(
        'activity_created',
        'New Activity Created',
        'New activity "' || NEW.activity_name || '" created by ' || COALESCE(child_name, 'Unknown Child'),
        NULL,
        parent_email,
        child_name,
        NEW.activity_name
    );
    
    -- Send email notification (async)
    PERFORM net.http_post(
        url := 'https://wipmfpcxquwrjszigwac.supabase.co/functions/v1/send-admin-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcG1mcGN4cXV3cmpzemlnd2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzMyMjAsImV4cCI6MjA2ODQwOTIyMH0.pyQ0UcR_sNz9X8TkLqnshwTaMbfgBNxgD5f-ViVcpn0"}'::jsonb,
        body := json_build_object(
            'notification_type', 'activity_created',
            'child_name', child_name,
            'activity_name', NEW.activity_name,
            'timestamp', now()
        )::jsonb
    );
    
    RETURN NEW;
END;
$$;