-- Create player_tasks table for admin-assigned tasks
CREATE TABLE public.player_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('video', 'text', 'file')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  content_url TEXT,
  content_text TEXT,
  file_path TEXT,
  order_index INTEGER DEFAULT 0,
  due_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  seen_at TIMESTAMPTZ
);

-- Add index for faster queries
CREATE INDEX idx_player_tasks_child_id ON public.player_tasks(child_id);
CREATE INDEX idx_player_tasks_status ON public.player_tasks(status);
CREATE INDEX idx_player_tasks_order ON public.player_tasks(order_index, created_at);

-- Enable RLS
ALTER TABLE public.player_tasks ENABLE ROW LEVEL SECURITY;

-- Players can only SELECT their own tasks
CREATE POLICY "Players can view their own tasks"
ON public.player_tasks
FOR SELECT
USING (
  child_id IN (SELECT child_id FROM public.get_user_child_ids())
  OR public.is_user_admin(auth.uid())
);

-- Only admins can INSERT tasks
CREATE POLICY "Admins can create tasks"
ON public.player_tasks
FOR INSERT
WITH CHECK (public.is_user_admin(auth.uid()));

-- Only admins can UPDATE tasks (status, content, etc.)
CREATE POLICY "Admins can update any task"
ON public.player_tasks
FOR UPDATE
USING (public.is_user_admin(auth.uid()));

-- Players can update their own tasks (for marking seen/completed)
CREATE POLICY "Players can update their own tasks"
ON public.player_tasks
FOR UPDATE
USING (child_id IN (SELECT child_id FROM public.get_user_child_ids()))
WITH CHECK (child_id IN (SELECT child_id FROM public.get_user_child_ids()));

-- Only admins can DELETE tasks
CREATE POLICY "Admins can delete tasks"
ON public.player_tasks
FOR DELETE
USING (public.is_user_admin(auth.uid()));

-- Create storage bucket for task files
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-task-files', 'player-task-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for task files - public read
CREATE POLICY "Task files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'player-task-files');

-- Storage policy - only admins can upload
CREATE POLICY "Admins can upload task files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'player-task-files' AND public.is_user_admin(auth.uid()));

-- Storage policy - only admins can delete
CREATE POLICY "Admins can delete task files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'player-task-files' AND public.is_user_admin(auth.uid()));