-- Add unique constraint to prevent duplicate parent records
ALTER TABLE public.parents ADD CONSTRAINT parents_user_id_unique UNIQUE (user_id);

-- Remove duplicate parent records, keeping only the most recent one
DELETE FROM public.parents 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.parents
  ORDER BY user_id, created_at DESC
);