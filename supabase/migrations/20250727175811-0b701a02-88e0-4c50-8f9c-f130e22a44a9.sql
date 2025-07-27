-- Fix the one real security issue: Function Search Path
-- Update functions to have proper search_path set

CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_action_logs (
      user_id, action_type, action_details, page_location
    ) VALUES (
      auth.uid(),
      'role_granted',
      jsonb_build_object('target_user_id', NEW.user_id, 'role', NEW.role),
      'admin_panel'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_action_logs (
      user_id, action_type, action_details, page_location
    ) VALUES (
      auth.uid(),
      'role_revoked',
      jsonb_build_object('target_user_id', OLD.user_id, 'role', OLD.role),
      'admin_panel'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;