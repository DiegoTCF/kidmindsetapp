-- Create helper function for updated_at if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create schedule_overrides table
CREATE TABLE IF NOT EXISTS public.schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_id UUID,
  schedule_date DATE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('skip','extra','replace')),
  original_activity TEXT,
  new_activity TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_overrides_user_date
  ON public.schedule_overrides (user_id, schedule_date);

CREATE INDEX IF NOT EXISTS idx_schedule_overrides_child_date
  ON public.schedule_overrides (child_id, schedule_date);

-- Enable RLS
ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own overrides; admins bypass
DROP POLICY IF EXISTS "Users can view their own schedule overrides" ON public.schedule_overrides;
CREATE POLICY "Users can view their own schedule overrides"
ON public.schedule_overrides
FOR SELECT
USING (auth.uid() = user_id OR (SELECT COALESCE(is_admin(), false)));

DROP POLICY IF EXISTS "Users can create their own schedule overrides" ON public.schedule_overrides;
CREATE POLICY "Users can create their own schedule overrides"
ON public.schedule_overrides
FOR INSERT
WITH CHECK (auth.uid() = user_id OR (SELECT COALESCE(is_admin(), false)));

DROP POLICY IF EXISTS "Users can update their own schedule overrides" ON public.schedule_overrides;
CREATE POLICY "Users can update their own schedule overrides"
ON public.schedule_overrides
FOR UPDATE
USING (auth.uid() = user_id OR (SELECT COALESCE(is_admin(), false)));

DROP POLICY IF EXISTS "Users can delete their own schedule overrides" ON public.schedule_overrides;
CREATE POLICY "Users can delete their own schedule overrides"
ON public.schedule_overrides
FOR DELETE
USING (auth.uid() = user_id OR (SELECT COALESCE(is_admin(), false)));

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_schedule_overrides_updated_at ON public.schedule_overrides;
CREATE TRIGGER update_schedule_overrides_updated_at
BEFORE UPDATE ON public.schedule_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();