-- Delete test accounts and all their data manually
-- First delete child_enrico@placeholder.com if it exists
DELETE FROM auth.users WHERE email = 'child_enrico@placeholder.com';

-- Delete Player One account (edd53eb7-de6b-410e-a724-4145acb2a1a4)
-- First delete all related data
DELETE FROM user_action_logs WHERE user_id = 'edd53eb7-de6b-410e-a724-4145acb2a1a4';
DELETE FROM user_roles WHERE user_id = 'edd53eb7-de6b-410e-a724-4145acb2a1a4';
DELETE FROM profiles WHERE user_id = 'edd53eb7-de6b-410e-a724-4145acb2a1a4';
DELETE FROM parents WHERE user_id = 'edd53eb7-de6b-410e-a724-4145acb2a1a4';
DELETE FROM auth.users WHERE id = 'edd53eb7-de6b-410e-a724-4145acb2a1a4';

-- Delete customer_child@placeholder.com account (e0cf498b-525b-42b1-b280-9e77cb215021)
DELETE FROM user_action_logs WHERE user_id = 'e0cf498b-525b-42b1-b280-9e77cb215021';
DELETE FROM user_roles WHERE user_id = 'e0cf498b-525b-42b1-b280-9e77cb215021';
DELETE FROM profiles WHERE user_id = 'e0cf498b-525b-42b1-b280-9e77cb215021';
DELETE FROM parents WHERE user_id = 'e0cf498b-525b-42b1-b280-9e77cb215021';
DELETE FROM auth.users WHERE id = 'e0cf498b-525b-42b1-b280-9e77cb215021';