-- Add PIN field to parents table for Grown Up Zone access
ALTER TABLE public.parents 
ADD COLUMN pin VARCHAR(4) CHECK (LENGTH(pin) = 4 AND pin ~ '^[0-9]{4}$');