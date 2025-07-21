-- Step 1: Remove duplicate parent records, keeping only the most recent one
DELETE FROM public.parents 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.parents
  ORDER BY user_id, created_at DESC
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.parents ADD CONSTRAINT parents_user_id_unique UNIQUE (user_id);