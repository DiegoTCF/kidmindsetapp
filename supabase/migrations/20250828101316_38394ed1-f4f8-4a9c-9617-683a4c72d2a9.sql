-- Create profile record for child so DNA data can be saved
INSERT INTO profiles (user_id, email, created_at, updated_at)
VALUES (
  '0904ed7d-acbe-4fd9-82e7-9df7070c1600',
  'child_enrico@placeholder.com', -- Placeholder email for child
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;