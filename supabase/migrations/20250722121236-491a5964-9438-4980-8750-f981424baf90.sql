-- Fix remaining security warnings by updating existing functions

-- Update get_current_user_child_id function
CREATE OR REPLACE FUNCTION public.get_current_user_child_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT children.id
    FROM children
    WHERE children.parent_id IN (
      SELECT parents.id
      FROM parents
      WHERE parents.user_id = auth.uid()
    )
    LIMIT 1
  );
END;
$$;

-- Update log_user_action function
CREATE OR REPLACE FUNCTION public.log_user_action(action_type_param text, action_details_param jsonb DEFAULT '{}'::jsonb, page_location_param text DEFAULT NULL::text, child_id_param uuid DEFAULT NULL::uuid)
RETURNS uuid
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