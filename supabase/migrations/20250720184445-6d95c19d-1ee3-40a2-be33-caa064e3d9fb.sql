-- Create daily_tasks table
CREATE TABLE public.daily_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_tasks
CREATE POLICY "Allow authenticated users to view daily tasks" 
ON public.daily_tasks 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create their own task overrides" 
ON public.daily_tasks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task overrides" 
ON public.daily_tasks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Insert default tasks (without user_id so they're global defaults)
INSERT INTO public.daily_tasks (label, "order", active) VALUES
('20x Press Ups', 1, true),
('20x Sit Ups or 1 min plank', 2, true),
('Make your bed', 3, true),
('Stretch your muscles', 4, true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_tasks_updated_at
BEFORE UPDATE ON public.daily_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();