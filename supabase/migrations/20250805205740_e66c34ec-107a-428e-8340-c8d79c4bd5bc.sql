-- Add unique constraint to user_id in player_identity table
ALTER TABLE public.player_identity ADD CONSTRAINT player_identity_user_id_unique UNIQUE (user_id);