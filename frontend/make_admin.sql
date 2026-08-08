-- ============================================
-- MAKE A USER AN ADMIN
-- Run this in Supabase SQL Editor
-- ============================================

-- This script finds the user by their email in auth.users
-- and creates/updates their profile in the profiles table to make them an 'admin'.
-- Change 'admi@gmail.com' below if your admin email is different!

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'admi@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email;
