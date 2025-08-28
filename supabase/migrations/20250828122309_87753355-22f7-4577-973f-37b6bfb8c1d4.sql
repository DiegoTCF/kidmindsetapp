-- Create missing profile record for customer's child
INSERT INTO profiles (user_id, email, created_at, updated_at)
VALUES (
  'e0cf498b-525b-42b1-b280-9e77cb215021',
  'customer_child@placeholder.com', -- Placeholder email for child
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;