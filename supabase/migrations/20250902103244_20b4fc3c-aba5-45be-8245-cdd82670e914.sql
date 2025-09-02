-- Fix profile email to match auth.users email for user zoe.day81@gmail.com
UPDATE profiles 
SET email = 'zoe.day81@gmail.com' 
WHERE user_id = 'a9b48fd1-948c-4e2c-871e-448c3953fe29';

-- Check for any other users with placeholder emails in profiles that don't match auth.users
-- and update them to use the real email from auth.users
UPDATE profiles 
SET email = au.email
FROM auth.users au
WHERE profiles.user_id = au.id 
AND profiles.email != au.email 
AND profiles.email LIKE '%@placeholder.com';