-- Fix the placeholder email for Alix (Oscar's mother)
UPDATE profiles 
SET email = 'alixbigois@gmail.com', updated_at = NOW()
WHERE user_id = 'f49ded9e-f208-4cc4-a548-9c8ffc9743b7' 
  AND email = 'user_f49ded9e-f208-4cc4-a548-9c8ffc9743b7@placeholder.com';