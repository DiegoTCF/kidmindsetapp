-- Update RLS policies for course_content to be admin-only
DROP POLICY IF EXISTS "Users can view all course content" ON public.course_content;
DROP POLICY IF EXISTS "Users can create course content" ON public.course_content;
DROP POLICY IF EXISTS "Users can update their own course content" ON public.course_content;
DROP POLICY IF EXISTS "Users can delete their own course content" ON public.course_content;

-- Create admin-only policies for course_content
CREATE POLICY "Admins can view all course content" 
ON public.course_content 
FOR SELECT 
USING (is_user_admin());

CREATE POLICY "Admins can create course content" 
ON public.course_content 
FOR INSERT 
WITH CHECK (is_user_admin());

CREATE POLICY "Admins can update course content" 
ON public.course_content 
FOR UPDATE 
USING (is_user_admin());

CREATE POLICY "Admins can delete course content" 
ON public.course_content 
FOR DELETE 
USING (is_user_admin());

-- Deny anonymous access to course_content
CREATE POLICY "course_content_deny_anonymous" 
ON public.course_content 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Update storage policies to be admin-only
DROP POLICY IF EXISTS "Allow public access to course content" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload course content" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update course content" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete course content" ON storage.objects;

-- Create admin-only storage policies
CREATE POLICY "Allow admins to view course content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND is_user_admin());

CREATE POLICY "Allow admins to upload course content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND is_user_admin());

CREATE POLICY "Allow admins to update course content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND is_user_admin());

CREATE POLICY "Allow admins to delete course content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id IN ('course-videos', 'course-audio', 'course-files') AND is_user_admin());