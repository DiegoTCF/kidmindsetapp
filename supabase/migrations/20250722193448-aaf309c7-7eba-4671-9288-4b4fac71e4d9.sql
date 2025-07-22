-- Create admin notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type TEXT NOT NULL CHECK (notification_type IN ('user_signup', 'activity_created')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_user_id UUID,
    related_user_email TEXT,
    related_child_name TEXT,
    related_activity_name TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all notifications
CREATE POLICY "Admins can view all notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (is_admin());

-- Create policy for system to insert notifications
CREATE POLICY "System can create notifications" 
ON public.admin_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to update notifications (mark as read)
CREATE POLICY "Admins can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
USING (is_admin());

-- Create function to add admin notification
CREATE OR REPLACE FUNCTION public.add_admin_notification(
    notification_type_param TEXT,
    title_param TEXT,
    message_param TEXT,
    related_user_id_param UUID DEFAULT NULL,
    related_user_email_param TEXT DEFAULT NULL,
    related_child_name_param TEXT DEFAULT NULL,
    related_activity_name_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.admin_notifications (
        notification_type,
        title,
        message,
        related_user_id,
        related_user_email,
        related_child_name,
        related_activity_name
    ) VALUES (
        notification_type_param,
        title_param,
        message_param,
        related_user_id_param,
        related_user_email_param,
        related_child_name_param,
        related_activity_name_param
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Create function to handle new user signup notifications
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
    
    RETURN NEW;
END;
$$;

-- Create function to handle new activity notifications
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
    
    RETURN NEW;
END;
$$;

-- Create triggers for notifications
CREATE TRIGGER trigger_new_user_notification
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_notification();

CREATE TRIGGER trigger_new_activity_notification
    AFTER INSERT ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_activity_notification();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at 
ON public.admin_notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type_read 
ON public.admin_notifications (notification_type, is_read);