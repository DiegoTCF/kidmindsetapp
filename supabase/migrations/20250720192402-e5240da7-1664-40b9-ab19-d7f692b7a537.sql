-- Update the super_behaviour_ratings table to include the new 'brave_on_ball' behaviour type
ALTER TABLE public.super_behaviour_ratings 
DROP CONSTRAINT super_behaviour_ratings_behaviour_type_check;

ALTER TABLE public.super_behaviour_ratings 
ADD CONSTRAINT super_behaviour_ratings_behaviour_type_check 
CHECK (behaviour_type IN ('brave_off_ball', 'electric', 'aggressive', 'brave_on_ball'));