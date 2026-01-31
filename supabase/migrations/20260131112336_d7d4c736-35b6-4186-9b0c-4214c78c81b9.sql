-- Allow admins to upload avatars for any user
CREATE POLICY "Admins can upload avatars for any user"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND public.is_admin()
);

-- Allow admins to update avatars for any user
CREATE POLICY "Admins can update avatars for any user"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND public.is_admin()
);

-- Allow admins to delete avatars for any user
CREATE POLICY "Admins can delete avatars for any user"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND public.is_admin()
);

-- Allow admins to upsert player identities for any user
CREATE POLICY "Admins can insert player identities"
ON public.player_identities
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update player identities"
ON public.player_identities
FOR UPDATE
USING (public.is_admin());