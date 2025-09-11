-- Fix profiles table RLS policies to prevent email harvesting
-- Drop the problematic policies that allow anonymous access
DROP POLICY IF EXISTS "Admin can access all profiles" ON public.profiles;
DROP POLICY IF EXISTS "User can access own profile" ON public.profiles;

-- Keep the existing secure policies and ensure they're comprehensive
-- The profiles_admin_full_access policy already restricts to admins only
-- The profiles_deny_anonymous policy already denies anonymous users  
-- The profiles_user_access policy already restricts to authenticated users accessing their own data

-- Verify we have proper policies (these should already exist but let's ensure they're correctly configured)
-- Admin policy: Only authenticated admins can access all profiles
CREATE POLICY IF NOT EXISTS "profiles_admin_full_access" ON public.profiles
FOR ALL USING (is_user_admin()) WITH CHECK (is_user_admin());

-- User policy: Only authenticated users can access their own profile  
CREATE POLICY IF NOT EXISTS "profiles_user_access" ON public.profiles
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Anonymous denial: Explicitly deny all anonymous access
CREATE POLICY IF NOT EXISTS "profiles_deny_anonymous" ON public.profiles
FOR ALL USING (false) WITH CHECK (false);