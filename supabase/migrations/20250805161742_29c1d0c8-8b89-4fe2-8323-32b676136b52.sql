-- Create storage buckets for content uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('course-videos', 'course-videos', true),
('course-audio', 'course-audio', true),
('course-files', 'course-files', true);

-- Create storage policies for content uploads
CREATE POLICY "Allow public access to course content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('course-videos', 'course-audio', 'course-files'));

CREATE POLICY "Allow authenticated users to upload course content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update course content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete course content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND auth.role() = 'authenticated');

-- Create table to track uploaded content metadata
CREATE TABLE public.course_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  file_size BIGINT,
  category TEXT DEFAULT 'general',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_content
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;

-- Create policies for course_content
CREATE POLICY "Users can view all course content" 
ON public.course_content 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create course content" 
ON public.course_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course content" 
ON public.course_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course content" 
ON public.course_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_content_updated_at
BEFORE UPDATE ON public.course_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();