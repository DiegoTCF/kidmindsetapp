-- Add columns to store individual pre-activity confidence ratings
ALTER TABLE activities 
ADD COLUMN pre_confidence_excited integer,
ADD COLUMN pre_confidence_nervous integer, 
ADD COLUMN pre_confidence_body_ready integer,
ADD COLUMN pre_confidence_believe_well integer;