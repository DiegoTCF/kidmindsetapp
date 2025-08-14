-- Add DNA fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT,
ADD COLUMN strengths TEXT[] DEFAULT '{}',
ADD COLUMN help_team TEXT[] DEFAULT '{}';