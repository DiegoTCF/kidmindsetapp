-- Update confidence rating columns to support decimal values (0.5 increments)
ALTER TABLE activities 
ALTER COLUMN pre_confidence_excited TYPE numeric(3,1),
ALTER COLUMN pre_confidence_nervous TYPE numeric(3,1),
ALTER COLUMN pre_confidence_body_ready TYPE numeric(3,1),
ALTER COLUMN pre_confidence_believe_well TYPE numeric(3,1);