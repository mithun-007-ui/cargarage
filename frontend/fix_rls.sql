-- ============================================
-- DISABLE RLS on ALL tables
-- This is the simplest fix - just turns off
-- security so the app can freely read/write.
-- Run this in Supabase SQL Editor.
-- ============================================

-- Drop any existing policies first (ignore errors if they don't exist)
DO $$ 
BEGIN
  -- services
  BEGIN DROP POLICY IF EXISTS "Allow all on services" ON public.services; EXCEPTION WHEN OTHERS THEN NULL; END;
  -- packages
  BEGIN DROP POLICY IF EXISTS "Allow all on packages" ON public.packages; EXCEPTION WHEN OTHERS THEN NULL; END;
  -- bookings
  BEGIN DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings; EXCEPTION WHEN OTHERS THEN NULL; END;
  -- health_reports
  BEGIN DROP POLICY IF EXISTS "Allow all on health_reports" ON public.health_reports; EXCEPTION WHEN OTHERS THEN NULL; END;
  -- health_report_items
  BEGIN DROP POLICY IF EXISTS "Allow all on health_report_items" ON public.health_report_items; EXCEPTION WHEN OTHERS THEN NULL; END;
  -- emergency_requests
  BEGIN DROP POLICY IF EXISTS "Allow all on emergency_requests" ON public.emergency_requests; EXCEPTION WHEN OTHERS THEN NULL; END;
  -- notifications
  BEGIN DROP POLICY IF EXISTS "Allow all on notifications" ON public.notifications; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- Now DISABLE RLS on every table
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_report_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
