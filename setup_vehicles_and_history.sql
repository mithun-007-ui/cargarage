-- ============================================
-- SQL SCRIPT: Setup Customer Vehicles, Service History, Vehicle Brands & Vehicle Models
-- Run this script in Supabase SQL Editor
-- ============================================

-- Step 1: Drop old tables if they exist with conflicting schemas
DROP TABLE IF EXISTS public.vehicle_models CASCADE;
DROP TABLE IF EXISTS public.vehicle_brands CASCADE;
DROP TABLE IF EXISTS public.service_history CASCADE;

-- Note: Keep customer_vehicles if needed or drop and recreate
DROP TABLE IF EXISTS public.customer_vehicles CASCADE;

-- Step 2: Create Customer Vehicles Table
CREATE TABLE public.customer_vehicles (
    id SERIAL PRIMARY KEY,
    customer_email TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year TEXT,
    plate_number TEXT NOT NULL,
    fuel_type TEXT,
    transmission TEXT,
    km_reading TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (customer_email, plate_number)
);

-- Step 3: Create Service History Table
CREATE TABLE public.service_history (
    id SERIAL PRIMARY KEY,
    booking_id TEXT,
    customer_email TEXT NOT NULL,
    plate_number TEXT,
    vehicle JSONB,
    service_name TEXT,
    service_type TEXT,
    status TEXT DEFAULT 'Completed',
    cost INTEGER DEFAULT 0,
    service_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 4: Create Vehicle Brands Table
CREATE TABLE public.vehicle_brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 5: Create Vehicle Models Table
CREATE TABLE public.vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    name TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Car',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (brand_name, name)
);

-- Step 6: Disable Row Level Security (RLS) to ensure full app access via Supabase Client
ALTER TABLE public.customer_vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models DISABLE ROW LEVEL SECURITY;

-- Step 7: Insert Vehicle Brands
INSERT INTO public.vehicle_brands (name) VALUES
('Toyota'),
('Hyundai'),
('Honda'),
('Maruti Suzuki'),
('Tata'),
('Mahindra'),
('Kia'),
('MG'),
('Volkswagen'),
('Skoda'),
('BMW'),
('Mercedes-Benz'),
('Audi'),
('Renault'),
('Nissan')
ON CONFLICT (name) DO NOTHING;

-- Step 8: Insert Vehicle Models for Brands
INSERT INTO public.vehicle_models (brand_id, brand_name, name)
SELECT b.id, b.name, m.name
FROM (VALUES
    ('Toyota', 'Fortuner'), ('Toyota', 'Innova Crysta'), ('Toyota', 'Glanza'), ('Toyota', 'Urban Cruiser Hyryder'), ('Toyota', 'Camry'),
    ('Hyundai', 'Creta'), ('Hyundai', 'Venue'), ('Hyundai', 'i20'), ('Hyundai', 'Verna'), ('Hyundai', 'Alcazar'), ('Hyundai', 'Exter'),
    ('Honda', 'City'), ('Honda', 'Amaze'), ('Honda', 'Elevate'), ('Honda', 'WR-V'),
    ('Maruti Suzuki', 'Swift'), ('Maruti Suzuki', 'Baleno'), ('Maruti Suzuki', 'Brezza'), ('Maruti Suzuki', 'Fronx'), ('Maruti Suzuki', 'Ertiga'), ('Maruti Suzuki', 'Grand Vitara'),
    ('Tata', 'Nexon'), ('Tata', 'Punch'), ('Tata', 'Harrier'), ('Tata', 'Safari'), ('Tata', 'Altroz'), ('Tata', 'Tiago'),
    ('Mahindra', 'Scorpio N'), ('Mahindra', 'XUV700'), ('Mahindra', 'Thar'), ('Mahindra', 'Bolero'), ('Mahindra', 'XUV 3XO'),
    ('Kia', 'Seltos'), ('Kia', 'Sonet'), ('Kia', 'Carens'), ('Kia', 'Syros'),
    ('MG', 'Hector'), ('MG', 'Astor'), ('MG', 'Comet EV'), ('MG', 'Gloster'), ('MG', 'Windsor EV'),
    ('Volkswagen', 'Virtus'), ('Volkswagen', 'Taigun'),
    ('Skoda', 'Slavia'), ('Skoda', 'Kushaq'), ('Skoda', 'Superb'),
    ('BMW', 'X1'), ('BMW', 'X3'), ('BMW', 'X5'), ('BMW', '3 Series'), ('BMW', '5 Series'),
    ('Mercedes-Benz', 'A-Class'), ('Mercedes-Benz', 'C-Class'), ('Mercedes-Benz', 'GLC'), ('Mercedes-Benz', 'GLE'), ('Mercedes-Benz', 'E-Class'),
    ('Audi', 'A4'), ('Audi', 'A6'), ('Audi', 'Q3'), ('Audi', 'Q5'), ('Audi', 'Q7'),
    ('Renault', 'Kiger'), ('Renault', 'Triber'), ('Renault', 'Kwid'),
    ('Nissan', 'Magnite'), ('Nissan', 'X-Trail')
) AS m(brand_name, name)
JOIN public.vehicle_brands b ON b.name = m.brand_name
ON CONFLICT (brand_name, name) DO NOTHING;

-- Step 9: Seed Initial Customer Vehicles Sample Data
INSERT INTO public.customer_vehicles (customer_email, make, model, year, plate_number, fuel_type, transmission, km_reading)
VALUES
('admi@gmail.com', 'Hyundai', 'i20', '2019', 'MH-02-AB-1234', 'Petrol', 'Manual', '45000'),
('admi@gmail.com', 'Honda', 'City', '2021', 'MH-01-XY-9876', 'Petrol', 'Automatic', '28000')
ON CONFLICT (customer_email, plate_number) DO NOTHING;

-- Step 10: Seed Initial Service History Sample Data
INSERT INTO public.service_history (booking_id, customer_email, plate_number, vehicle, service_name, service_type, status, cost, service_date)
VALUES
('B-20260810-1001', 'admi@gmail.com', 'MH-02-AB-1234', '{"make":"Hyundai","model":"i20","year":"2019","plateNumber":"MH-02-AB-1234"}'::jsonb, 'General Maintenance Check & Synthetic Oil Change', 'Scheduled Maintenance', 'Completed', 5499, NOW() - INTERVAL '2 days'),
('B-20260812-1002', 'admi@gmail.com', 'MH-01-XY-9876', '{"make":"Honda","model":"City","year":"2021","plateNumber":"MH-01-XY-9876"}'::jsonb, 'AC Gas Recharge & Clean', 'Repair & Diagnostic', 'In Progress', 1499, NOW() - INTERVAL '1 day');
