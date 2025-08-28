-- Remove foreign key constraint on user_ants.user_id 
-- This allows the table to store ANT data for both auth users and child IDs
ALTER TABLE user_ants DROP CONSTRAINT IF EXISTS user_ants_user_id_fkey;