-- Create a comprehensive user action logging system
CREATE TABLE IF NOT EXISTS public.user_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    child_id UUID,
    action_type TEXT NOT NULL,
    action_details JSONB NOT NULL DEFAULT '{}',
    page_location TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user action logs
ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user action logs
CREATE POLICY "Users can create their own action logs" 
ON public.user_action_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own action logs" 
ON public.user_action_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all action logs" 
ON public.user_action_logs 
FOR SELECT 
USING (is_admin());

-- Create function to log user actions
CREATE OR REPLACE FUNCTION public.log_user_action(
    action_type_param TEXT,
    action_details_param JSONB DEFAULT '{}',
    page_location_param TEXT DEFAULT NULL,
    child_id_param UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.user_action_logs (
        user_id,
        child_id,
        action_type,
        action_details,
        page_location,
        session_id
    ) VALUES (
        auth.uid(),
        child_id_param,
        action_type_param,
        action_details_param,
        page_location_param,
        COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'session_id'::text),
            gen_random_uuid()::text
        )
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user_id_timestamp 
ON public.user_action_logs (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_child_id_timestamp 
ON public.user_action_logs (child_id, timestamp DESC) 
WHERE child_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_action_logs_action_type 
ON public.user_action_logs (action_type);

-- Fix potential RLS issues with activities table
-- Let's check if parents can actually get their child_id properly
CREATE OR REPLACE FUNCTION public.get_user_child_ids()
RETURNS TABLE(child_id UUID)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id as child_id
  FROM children c
  JOIN parents p ON c.parent_id = p.id
  WHERE p.user_id = auth.uid();
$$;

-- Update the activities INSERT policy to be more explicit
DROP POLICY IF EXISTS "Parents can create activities for their children" ON public.activities;

CREATE POLICY "Parents can create activities for their children" 
ON public.activities 
FOR INSERT 
WITH CHECK (
    child_id IN (
        SELECT c.id
        FROM children c
        JOIN parents p ON c.parent_id = p.id
        WHERE p.user_id = auth.uid()
    )
);