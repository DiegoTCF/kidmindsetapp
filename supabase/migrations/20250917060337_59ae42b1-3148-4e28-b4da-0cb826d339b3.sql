-- Create session tracking table
CREATE TABLE public.session_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  activity_id UUID,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  session_status TEXT NOT NULL DEFAULT 'pending' CHECK (session_status IN ('pending', 'completed', 'cancelled', 'missed')),
  activity_name TEXT,
  activity_type TEXT,
  pre_form_completed BOOLEAN DEFAULT FALSE,
  post_form_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on session_tracking
ALTER TABLE public.session_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for session_tracking
CREATE POLICY "session_tracking_admin_access" 
ON public.session_tracking 
FOR ALL 
USING (is_user_admin())
WITH CHECK (is_user_admin());

CREATE POLICY "session_tracking_deny_anonymous" 
ON public.session_tracking 
FOR ALL 
USING (false)
WITH CHECK (false);

CREATE POLICY "session_tracking_parent_access" 
ON public.session_tracking 
FOR ALL 
USING (user_owns_child(child_id))
WITH CHECK (user_owns_child(child_id));

-- Create function to log session status
CREATE OR REPLACE FUNCTION public.log_session_status(
  p_child_id UUID,
  p_session_date DATE,
  p_status TEXT,
  p_activity_name TEXT DEFAULT NULL,
  p_activity_type TEXT DEFAULT NULL,
  p_day_of_week TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_id UUID;
  calculated_day TEXT;
BEGIN
  -- Calculate day of week if not provided
  IF p_day_of_week IS NULL THEN
    calculated_day := LOWER(TO_CHAR(p_session_date, 'Day'));
    calculated_day := TRIM(calculated_day);
  ELSE
    calculated_day := p_day_of_week;
  END IF;

  -- Check if session already exists for this date
  SELECT id INTO session_id
  FROM session_tracking
  WHERE child_id = p_child_id 
    AND session_date = p_session_date;

  IF session_id IS NULL THEN
    -- Create new session
    INSERT INTO session_tracking (
      child_id,
      session_date,
      day_of_week,
      session_status,
      activity_name,
      activity_type
    ) VALUES (
      p_child_id,
      p_session_date,
      calculated_day,
      p_status,
      p_activity_name,
      p_activity_type
    )
    RETURNING id INTO session_id;
  ELSE
    -- Update existing session
    UPDATE session_tracking
    SET 
      session_status = p_status,
      activity_name = COALESCE(p_activity_name, activity_name),
      activity_type = COALESCE(p_activity_type, activity_type),
      updated_at = now()
    WHERE id = session_id;
  END IF;

  RETURN session_id;
END;
$$;

-- Add day_of_week column to activities table
ALTER TABLE public.activities 
ADD COLUMN day_of_week TEXT;

-- Create trigger to automatically create session tracking when activity is created
CREATE OR REPLACE FUNCTION public.create_session_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create session tracking entry
  PERFORM log_session_status(
    NEW.child_id,
    NEW.activity_date,
    CASE 
      WHEN NEW.pre_activity_completed AND NEW.post_activity_completed THEN 'completed'
      ELSE 'pending'
    END,
    NEW.activity_name,
    NEW.activity_type,
    NEW.day_of_week
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on activities table
CREATE TRIGGER trigger_create_session_tracking
  AFTER INSERT ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.create_session_tracking();

-- Create trigger to update session status when activity is updated
CREATE OR REPLACE FUNCTION public.update_session_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update session status based on activity completion
  UPDATE session_tracking
  SET 
    session_status = CASE 
      WHEN NEW.pre_activity_completed AND NEW.post_activity_completed THEN 'completed'
      ELSE 'pending'
    END,
    pre_form_completed = NEW.pre_activity_completed,
    post_form_completed = NEW.post_activity_completed,
    activity_id = NEW.id,
    updated_at = now()
  WHERE child_id = NEW.child_id 
    AND session_date = NEW.activity_date;
  
  RETURN NEW;
END;
$$;

-- Create trigger on activities table for updates
CREATE TRIGGER trigger_update_session_tracking
  AFTER UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_tracking();