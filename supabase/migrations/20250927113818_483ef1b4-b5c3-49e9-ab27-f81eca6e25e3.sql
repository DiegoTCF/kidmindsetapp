-- First drop the generated column constraint
ALTER TABLE super_behaviour_ratings 
DROP COLUMN average_score;

-- Update rating columns to support decimal values
ALTER TABLE super_behaviour_ratings 
ALTER COLUMN question_1_rating TYPE numeric(3,1),
ALTER COLUMN question_2_rating TYPE numeric(3,1),
ALTER COLUMN question_3_rating TYPE numeric(3,1),
ALTER COLUMN question_4_rating TYPE numeric(3,1);

-- Re-add the average_score column as a generated column with the new numeric type
ALTER TABLE super_behaviour_ratings 
ADD COLUMN average_score numeric(3,1) GENERATED ALWAYS AS (
  CASE 
    WHEN question_1_rating IS NOT NULL 
         AND question_2_rating IS NOT NULL 
         AND question_3_rating IS NOT NULL 
         AND question_4_rating IS NOT NULL 
    THEN ROUND((question_1_rating + question_2_rating + question_3_rating + question_4_rating) / 4.0, 1)
    ELSE NULL
  END
) STORED;