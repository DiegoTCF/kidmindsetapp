-- Test the level system by manually triggering the sync for a user with enough points
SELECT sync_child_points();

-- Check if any children should be at higher levels
UPDATE children 
SET level = 1 + (points / 100)
WHERE points >= 100;