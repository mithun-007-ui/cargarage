-- ============================================================================
-- SQL SCRIPT: fix_bookings_rls.sql
-- Fix Row-Level Security (RLS) policies for bookings, customer_vehicles, 
-- service_history, notifications, and reports tables in Supabase.
-- Run this script in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- ============================================================================

-- ── 1. BOOKINGS TABLE RLS ───────────────────────────────────────────────────

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public and auth users to insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow users and admins to select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow users and admins to update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow admins to delete bookings" ON public.bookings;

-- INSERT: Allow anyone (authenticated users & guests) to create a booking
CREATE POLICY "Allow public and auth users to insert bookings" ON public.bookings
FOR INSERT WITH CHECK (true);

-- SELECT: Allow users to view their own bookings (by id or email), and admins/staff to view all
CREATE POLICY "Allow users and admins to select bookings" ON public.bookings
FOR SELECT USING (
    auth.uid()::text = customer_id::text
    OR customer_email = (auth.jwt() ->> 'email')
    OR customer_email = (SELECT email FROM public.profiles WHERE id::text = auth.uid()::text)
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff', 'technician')
    )
    OR auth.role() = 'anon'
);

-- UPDATE: Allow users to update their own bookings, and staff/admins to update status
CREATE POLICY "Allow users and admins to update bookings" ON public.bookings
FOR UPDATE USING (
    auth.uid()::text = customer_id::text
    OR customer_email = (auth.jwt() ->> 'email')
    OR customer_email = (SELECT email FROM public.profiles WHERE id::text = auth.uid()::text)
    OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff', 'technician')
    )
);

-- DELETE: Allow admins to delete bookings
CREATE POLICY "Allow admins to delete bookings" ON public.bookings
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id::text = auth.uid()::text AND role = 'admin'
    )
);


-- ── 2. CUSTOMER_VEHICLES TABLE RLS ──────────────────────────────────────────

ALTER TABLE public.customer_vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert vehicles" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow select vehicles" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow update vehicles" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow delete vehicles" ON public.customer_vehicles;

CREATE POLICY "Allow insert vehicles" ON public.customer_vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select vehicles" ON public.customer_vehicles FOR SELECT USING (true);
CREATE POLICY "Allow update vehicles" ON public.customer_vehicles FOR UPDATE USING (true);
CREATE POLICY "Allow delete vehicles" ON public.customer_vehicles FOR DELETE USING (true);


-- ── 3. SERVICE_HISTORY TABLE RLS ────────────────────────────────────────────

ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert service_history" ON public.service_history;
DROP POLICY IF EXISTS "Allow select service_history" ON public.service_history;
DROP POLICY IF EXISTS "Allow update service_history" ON public.service_history;
DROP POLICY IF EXISTS "Allow delete service_history" ON public.service_history;

CREATE POLICY "Allow insert service_history" ON public.service_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select service_history" ON public.service_history FOR SELECT USING (true);
CREATE POLICY "Allow update service_history" ON public.service_history FOR UPDATE USING (true);
CREATE POLICY "Allow delete service_history" ON public.service_history FOR DELETE USING (true);


-- ── 4. NOTIFICATIONS TABLE RLS ──────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow select notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow update notifications" ON public.notifications;

CREATE POLICY "Allow insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow update notifications" ON public.notifications FOR UPDATE USING (true);


-- ── 5. REPORTS TABLE RLS ───────────────────────────────────────────────────

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert reports" ON public.reports;
DROP POLICY IF EXISTS "Allow select reports" ON public.reports;
DROP POLICY IF EXISTS "Allow update reports" ON public.reports;

CREATE POLICY "Allow insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow update reports" ON public.reports FOR UPDATE USING (true);
