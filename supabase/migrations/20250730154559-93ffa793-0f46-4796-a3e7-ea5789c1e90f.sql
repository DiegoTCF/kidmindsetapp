-- Check what entry types are currently allowed
DO $$
DECLARE
    constraint_def text;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint 
    WHERE conname = 'progress_entries_entry_type_check';
    
    RAISE NOTICE 'Current constraint: %', constraint_def;
    
    -- Also check if we need to add 'task' as a valid entry type
    IF constraint_def NOT LIKE '%task%' THEN
        -- Add 'task' to the allowed entry types
        ALTER TABLE progress_entries DROP CONSTRAINT IF EXISTS progress_entries_entry_type_check;
        ALTER TABLE progress_entries ADD CONSTRAINT progress_entries_entry_type_check 
        CHECK (entry_type IN ('mood', 'task', 'activity', 'goal', 'behavior'));
        RAISE NOTICE 'Updated constraint to include task, activity, goal, and behavior types';
    END IF;
END $$;