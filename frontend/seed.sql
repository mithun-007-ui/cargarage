-- ============================================
-- COMPLETE RESET & SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop everything cleanly
DROP TABLE IF EXISTS public.health_report_items CASCADE;
DROP TABLE IF EXISTS public.health_reports CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.emergency_requests CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.customer_vehicles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create all tables matching the app code exactly

-- Services
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price INTEGER DEFAULT 0,
    icon TEXT,
    description TEXT,
    duration TEXT,
    popular BOOLEAN DEFAULT false
);

-- Packages
CREATE TABLE public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER DEFAULT 0,
    description TEXT,
    duration TEXT,
    popular BOOLEAN DEFAULT false,
    features JSONB
);

-- Bookings
CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY DEFAULT ('B-' || to_char(NOW(),'YYYYMMDD') || '-' || floor(random()*9000+1000)::text),
    customer_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    vehicle JSONB,
    service_type TEXT,
    selected_services JSONB,
    package_selected TEXT,
    package_price INTEGER DEFAULT 0,
    estimated_price INTEGER DEFAULT 0,
    service_center TEXT,
    pickup_option TEXT,
    booking_date TEXT,
    booking_time TEXT,
    status TEXT DEFAULT 'Booked',
    payment_status TEXT DEFAULT 'Pending',
    technician_assigned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Reports (health inspection reports, items stored as JSONB array)
CREATE TABLE public.reports (
    id SERIAL PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    notes TEXT,
    health_score INTEGER DEFAULT 85,
    components JSONB,
    items JSONB,
    report_sent BOOLEAN DEFAULT false
);

-- Emergency Requests
CREATE TABLE public.emergency_requests (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    location TEXT,
    vehicle_details TEXT,
    breakdown_type TEXT,
    issue TEXT,
    towing_required BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notifications
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Customer Vehicles
CREATE TABLE public.customer_vehicles (
    id SERIAL PRIMARY KEY,
    customer_email TEXT,
    make TEXT,
    model TEXT,
    year TEXT,
    plate_number TEXT,
    fuel_type TEXT,
    transmission TEXT,
    km_reading TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (customer_email, plate_number)
);

-- Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 3: DISABLE RLS on all tables (so anon key can read/write)
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Seed services data
INSERT INTO public.services (id, name, category, price, icon, description, duration, popular) VALUES
('general-maintenance', 'General Maintenance Check', 'engine', 1499, 'Wrench', '50-point vehicle health inspection covering engine, brakes, tyres and more.', '~2 hrs', true),
('oil-change', 'Synthetic Oil Change', 'engine', 2499, 'Droplet', 'Full synthetic oil & OES filter replacement with fluid top-up.', '~45 min', true),
('brake-service', 'Brake Pad Service', 'brakes', 1999, 'ShieldAlert', 'Inspect, clean and replace brake pads with disc check and fluid top-up.', '~90 min', false),
('ac-service', 'AC Gas Recharge & Clean', 'ac', 1299, 'Wind', 'Pressure test, refrigerant recharge and cabin filter clean.', '~60 min', false),
('battery-replacement', 'Battery Check & Replace', 'electrical', 899, 'BatteryCharging', 'Load test existing battery and fit new Amaron/Exide if needed.', '~45 min', false),
('wheel-alignment', 'Wheel Alignment & Balancing', 'brakes', 999, 'Circle', 'Full 4-wheel alignment, balance and tyre rotation.', '~60 min', true),
('car-wash', 'Premium Car Wash & Spa', 'detailing', 799, 'Sparkles', 'Full exterior hand wash, tyre dressing and interior vacuum.', '~45 min', true),
('interior-cleaning', 'Deep Interior Dry Cleaning', 'detailing', 1499, 'Sofa', 'Shampoo seats, mats, roof lining and dashboard detailing.', '~3 hrs', false),
('exterior-polishing', 'Exterior Wax & Polish', 'detailing', 1999, 'Star', 'Machine polish, paint correction and carnauba wax coat.', '~4 hrs', false),
('coolant-replacement', 'Radiator Coolant Flush', 'engine', 1199, 'Thermometer', 'Drain and refill with OEM-spec coolant and pressure test.', '~45 min', false),
('suspension-check', 'Suspension & Shock Check', 'brakes', 899, 'ArrowUpDown', 'Full suspension geometry check and shock absorber inspection.', '~60 min', false),
('spark-plug-replacement', 'Spark Plug Replacement', 'electrical', 699, 'Zap', 'Remove old plugs and fit new NGK/Bosch spec plugs.', '~60 min', false),
('air-filter-replacement', 'Air & Cabin Filter', 'engine', 599, 'Fan', 'Replace engine air filter and cabin pollen filter.', '~30 min', false),
('tyre-replacement', 'Tyre Rotation & Inspection', 'brakes', 499, 'Disc', 'Rotate all 4 tyres, inspect tread depth and set correct pressure.', '~30 min', false),
('engine-diagnosis', 'Engine Diagnosis Scan', 'engine', 799, 'Cpu', 'OBD2 scan, fault code read and full engine diagnosis report.', '~45 min', false);

-- Step 5: Seed packages data
INSERT INTO public.packages (id, name, price, description, duration, popular, features) VALUES
('silver-care', 'Silver Care', 1499, 'Essential maintenance pack for city drivers.', '~2 hrs', false, '["Synthetic Oil & Filter Change","24-Point Health Inspection","Fluid Top-up (Brakes, Coolant, Windshield)","Tyre Pressure & Wear Check","Battery Diagnostic Test"]'::jsonb),
('gold-care', 'Gold Care', 2499, 'Complete yearly maintenance and protection.', '~4 hrs', true, '["All Silver Care features","Full Tyre Rotation & Balancing","Air & Cabin Filter Replacement","Spark Plug Integrity Check","Brake System Service & Cleaning","AC Efficiency Diagnostic"]'::jsonb),
('platinum-care', 'Platinum Care', 3999, 'Ultimate detailing, protection, and priority service.', 'Full Day', false, '["All Gold Care features","Engine Flush & Carbon Cleaning","Fuel Injector Cleaning service","Wiper Blade Replacement","Wheel Alignment Adjustments","Priority Lounge Access & Free Towing (1 Year)","Complete Interior & Exterior Wash"]'::jsonb);

-- Step 6: Seed sample bookings
INSERT INTO public.bookings (id, customer_name, customer_email, vehicle, service_type, estimated_price, service_center, pickup_option, booking_date, booking_time, status, payment_status, technician_assigned, created_at) VALUES
('B-20260810-1001', 'Rahul Sharma', 'admi@gmail.com', '{"make":"Hyundai","model":"i20","year":"2019","plateNumber":"MH-02-AB-1234"}', 'Scheduled Maintenance', 5499, 'AutoCare Pro — Andheri West', 'pickup', '2026-08-10', '10:00 AM', 'Completed', 'Paid', 'Raju Mechanic', NOW() - INTERVAL '2 days'),
('B-20260812-1002', 'Priya Patel', 'admi@gmail.com', '{"make":"Honda","model":"City","year":"2021","plateNumber":"MH-01-XY-9876"}', 'Repair & Diagnostic', 1499, 'AutoCare Pro — Bandra East', 'dropoff', '2026-08-12', '02:00 PM', 'Vehicle Received', 'Pending', 'Suresh Kumar', NOW() - INTERVAL '1 day');
