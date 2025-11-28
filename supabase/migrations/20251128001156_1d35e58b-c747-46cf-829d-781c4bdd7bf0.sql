-- Add address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN street TEXT,
ADD COLUMN number TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN is_default_address BOOLEAN DEFAULT true;