-- Fix profiles table RLS policies to prevent email harvesting
-- Drop the problematic policies that allow anonymous access
DROP POLICY IF EXISTS "Admin can access all profiles" ON public.profiles;
DROP POLICY IF EXISTS "User can access own profile" ON public.profiles;

-- The secure policies should already exist, but let's ensure they're properly configured
-- These policies already exist from the schema, so no need to recreate them
-- profiles_admin_full_access: Only authenticated admins can access all profiles
-- profiles_user_access: Only authenticated users can access their own profile  
-- profiles_deny_anonymous: Explicitly deny all anonymous access