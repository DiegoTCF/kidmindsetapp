-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Grant pagliusodiego@gmail.com admin role automatically
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'pagliusodiego@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    WHERE (check_user_id IS NULL AND au.email = 'pagliusodiego@gmail.com') 
       OR (check_user_id IS NOT NULL AND ur.user_id = check_user_id AND ur.role = 'admin')
       OR (check_user_id IS NULL AND ur.user_id = auth.uid() AND ur.role = 'admin')
  );
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Only admins can view user roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Only superadmin can insert user roles" 
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'pagliusodiego@gmail.com'
  )
);

CREATE POLICY "Only superadmin can update user roles"
ON public.user_roles  
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'pagliusodiego@gmail.com'
  )
);

-- Create admin view for profiles (admins can see all profiles)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Create admin view for parents (admins can see all parents)  
CREATE POLICY "Admins can view all parents"
ON public.parents
FOR SELECT  
USING (public.is_admin());

-- Create admin view for children (admins can see all children)
CREATE POLICY "Admins can view all children"
ON public.children
FOR SELECT
USING (public.is_admin());

-- Create admin view for activities (admins can see all activities)
CREATE POLICY "Admins can view all activities" 
ON public.activities
FOR SELECT
USING (public.is_admin());

-- Create admin view for progress entries (admins can see all progress)
CREATE POLICY "Admins can view all progress entries"
ON public.progress_entries  
FOR SELECT
USING (public.is_admin());

-- Create admin view for super behaviour ratings (admins can see all ratings)
CREATE POLICY "Admins can view all super behaviour ratings"
ON public.super_behaviour_ratings
FOR SELECT  
USING (public.is_admin());

-- Create trigger for updating updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();