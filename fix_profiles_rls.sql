-- ============================================================================
-- fix_profiles_rls.sql
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).
--
-- This script does two things:
--
--  1. Updates the DB trigger that fires on auth.users INSERT so it now reads
--     full_name and phone from raw_user_meta_data (the `options.data` object
--     passed to supabase.auth.signUp() on the client). This means the profile
--     row is written in a single, secure DB-side operation with no RLS issue.
--
--  2. Adds proper RLS policies to the `profiles` table so that:
--     - Anyone can INSERT their own profile row (needed if trigger is delayed).
--     - Authenticated users can SELECT and UPDATE ONLY their own row.
--     - Admins can do everything (service_role key bypasses RLS anyway, but
--       this covers admin queries made with the anon key + admin JWT).
-- ============================================================================


-- ── Step 1: Update the trigger function ──────────────────────────────────────
--
-- Replace handle_new_user() so it also writes full_name and phone.
-- raw_user_meta_data is the JSONB column that Supabase populates from
-- the `options.data` object you pass to supabase.auth.signUp().
--
-- SECURITY DEFINER means the function runs as the DB owner (postgres),
-- which bypasses RLS — this is correct and safe for a trigger.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    'customer',
    -- Read from the metadata passed in signUp options.data (can be NULL if not provided)
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  -- If a row already exists (e.g. app-side upsert raced ahead), update it
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone     = EXCLUDED.phone;

  RETURN NEW;
END;
$$;

-- Make sure the trigger is attached to auth.users (re-create if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── Step 2: Add RLS policies for the profiles table ──────────────────────────
--
-- RLS must be ENABLED on profiles for these policies to apply.
-- (Supabase enables it by default for new tables.)

-- Helper function to check if the current user is an admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT role = 'admin' INTO is_admin FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(is_admin, false);
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies first so this script is safe to re-run
DROP POLICY IF EXISTS "Users can view their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything"           ON public.profiles;

-- SELECT: a user can only read their own row
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- UPDATE: a user can only update their own row
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: allow authenticated users to insert ONLY their own row.
-- This covers any race condition where the trigger hasn't fired yet.
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ALL: service_role bypasses RLS automatically, but this covers
-- any admin queries made from the app with the anon key + admin JWT.
CREATE POLICY "Admins can do everything"
  ON public.profiles
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR public.is_admin()
  );
