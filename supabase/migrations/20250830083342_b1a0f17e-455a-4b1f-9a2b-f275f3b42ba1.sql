-- Delete the 3 test/placeholder accounts
SELECT admin_delete_user('edd53eb7-de6b-410e-a724-4145acb2a1a4'::uuid) as delete_player_one;
SELECT admin_delete_user('e0cf498b-525b-42b1-b280-9e77cb215021'::uuid) as delete_customer_child;

-- Find and delete child_enrico@placeholder.com account
DO $$
DECLARE
    enrico_user_id uuid;
BEGIN
    SELECT id INTO enrico_user_id 
    FROM auth.users 
    WHERE email = 'child_enrico@placeholder.com';
    
    IF enrico_user_id IS NOT NULL THEN
        PERFORM admin_delete_user(enrico_user_id);
        RAISE NOTICE 'Deleted child_enrico@placeholder.com with ID: %', enrico_user_id;
    ELSE
        RAISE NOTICE 'child_enrico@placeholder.com not found';
    END IF;
END $$;