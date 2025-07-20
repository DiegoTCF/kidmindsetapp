-- Add worry tracking columns to activities table
ALTER TABLE public.activities 
ADD COLUMN worry_reason TEXT,
ADD COLUMN worry_answers JSONB;