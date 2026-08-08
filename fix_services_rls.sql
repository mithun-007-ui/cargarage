-- Enable RLS on tables (just in case they aren't already)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.packages;

-- Create policies to allow anyone (anon and authenticated) to read services and packages
CREATE POLICY "Enable read access for all users" 
ON public.services FOR SELECT 
USING (true);

CREATE POLICY "Enable read access for all users" 
ON public.packages FOR SELECT 
USING (true);
