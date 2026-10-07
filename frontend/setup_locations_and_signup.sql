-- ============================================
-- SQL SCRIPT: Setup States, Districts, Areas, Locations & Signup Profile Fields
-- With Row Level Security (RLS) ENABLED & Public Read Policies
-- Run this script in Supabase SQL Editor
-- ============================================

-- Step 1: Drop old tables cleanly if they exist with outdated column definitions
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.districts CASCADE;
DROP TABLE IF EXISTS public.states CASCADE;

-- Step 2: Create States Table
CREATE TABLE public.states (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 3: Create Districts Table
CREATE TABLE public.districts (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES public.states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (state_id, name)
);

-- Step 4: Create Areas (Localities in District) Table
CREATE TABLE public.areas (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES public.states(id) ON DELETE CASCADE,
    district_id INTEGER REFERENCES public.districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (district_id, name)
);

-- Step 5: Create Locations (Service Centers) Table
CREATE TABLE public.locations (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES public.states(id) ON DELETE CASCADE,
    district_id INTEGER REFERENCES public.districts(id) ON DELETE CASCADE,
    area_id INTEGER REFERENCES public.areas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    timing TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 6: Add state_id, district_id, area_id, state, district, area to profiles table if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='state_id') THEN
        ALTER TABLE public.profiles ADD COLUMN state_id INTEGER REFERENCES public.states(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='district_id') THEN
        ALTER TABLE public.profiles ADD COLUMN district_id INTEGER REFERENCES public.districts(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='area_id') THEN
        ALTER TABLE public.profiles ADD COLUMN area_id INTEGER REFERENCES public.areas(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='state') THEN
        ALTER TABLE public.profiles ADD COLUMN state TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='district') THEN
        ALTER TABLE public.profiles ADD COLUMN district TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='area') THEN
        ALTER TABLE public.profiles ADD COLUMN area TEXT;
    END IF;
END $$;

-- Step 7: ENABLE Row Level Security (RLS) on all location reference tables
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Step 8: Add Public Read RLS Policies
-- Allows anonymous guests (on signup page) & logged-in users to SELECT/read location options,
-- while blocking unauthorized INSERT, UPDATE, or DELETE modifications.
DROP POLICY IF EXISTS "Public read access for states" ON public.states;
CREATE POLICY "Public read access for states" ON public.states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for districts" ON public.districts;
CREATE POLICY "Public read access for districts" ON public.districts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for areas" ON public.areas;
CREATE POLICY "Public read access for areas" ON public.areas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for locations" ON public.locations;
CREATE POLICY "Public read access for locations" ON public.locations FOR SELECT USING (true);

-- Step 9: Update handle_new_user() trigger function to save location data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, phone, state_id, district_id, area_id, state, district, area)
  VALUES (
    NEW.id,
    NEW.email,
    'customer',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'state_id')::integer,
    (NEW.raw_user_meta_data->>'district_id')::integer,
    (NEW.raw_user_meta_data->>'area_id')::integer,
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'area'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name   = EXCLUDED.full_name,
    phone       = EXCLUDED.phone,
    state_id    = COALESCE(EXCLUDED.state_id, profiles.state_id),
    district_id = COALESCE(EXCLUDED.district_id, profiles.district_id),
    area_id     = COALESCE(EXCLUDED.area_id, profiles.area_id),
    state       = COALESCE(EXCLUDED.state, profiles.state),
    district    = COALESCE(EXCLUDED.district, profiles.district),
    area        = COALESCE(EXCLUDED.area, profiles.area);

  RETURN NEW;
END;
$$;

-- Step 10: Seed States
INSERT INTO public.states (name) VALUES
('Tamil Nadu'),
('Karnataka'),
('Kerala'),
('Maharashtra'),
('Telangana'),
('Andhra Pradesh'),
('Delhi'),
('Gujarat')
ON CONFLICT (name) DO NOTHING;

-- Step 11: Seed Districts for States
INSERT INTO public.districts (state_id, name)
SELECT s.id, d.name
FROM (VALUES
    ('Erode'), ('Coimbatore'), ('Chennai'), ('Salem'), ('Madurai'), ('Tiruchirappalli'),
    ('Tiruppur'), ('Vellore'), ('Kanchipuram'), ('Thanjavur'), ('Dindigul'), ('Karur'), ('Namakkal')
) AS d(name)
CROSS JOIN public.states s WHERE s.name = 'Tamil Nadu'
ON CONFLICT (state_id, name) DO NOTHING;

INSERT INTO public.districts (state_id, name)
SELECT s.id, d.name
FROM (VALUES
    ('Bengaluru Urban'), ('Mysuru'), ('Mangaluru'), ('Belagavi'), ('Hubballi-Dharwad')
) AS d(name)
CROSS JOIN public.states s WHERE s.name = 'Karnataka'
ON CONFLICT (state_id, name) DO NOTHING;

INSERT INTO public.districts (state_id, name)
SELECT s.id, d.name
FROM (VALUES
    ('Mumbai'), ('Pune'), ('Nagpur'), ('Nashik'), ('Thane')
) AS d(name)
CROSS JOIN public.states s WHERE s.name = 'Maharashtra'
ON CONFLICT (state_id, name) DO NOTHING;

-- Step 12: Seed Areas for Districts
INSERT INTO public.areas (state_id, district_id, name)
SELECT d.state_id, d.id, a.name
FROM (VALUES
    ('Perundurai Road'), ('Collectorate Area'), ('NH-544 Bypass'), ('Bus Stand Road'), ('Bhavani Road')
) AS a(name)
CROSS JOIN public.districts d WHERE d.name = 'Erode'
ON CONFLICT (district_id, name) DO NOTHING;

INSERT INTO public.areas (state_id, district_id, name)
SELECT d.state_id, d.id, a.name
FROM (VALUES
    ('Avinashi Road / Hope College'), ('RS Puram'), ('Gandhipuram'), ('Peelamedu'), ('Saravanampatti')
) AS a(name)
CROSS JOIN public.districts d WHERE d.name = 'Coimbatore'
ON CONFLICT (district_id, name) DO NOTHING;

INSERT INTO public.areas (state_id, district_id, name)
SELECT d.state_id, d.id, a.name
FROM (VALUES
    ('Anna Nagar'), ('OMR Guindy'), ('T. Nagar'), ('Velachery')
) AS a(name)
CROSS JOIN public.districts d WHERE d.name = 'Chennai'
ON CONFLICT (district_id, name) DO NOTHING;

-- Step 13: Seed Service Centers (Locations)
INSERT INTO public.locations (state_id, district_id, area_id, name, address, timing)
SELECT s.id, d.id, a.id, l.name, l.address, l.timing
FROM (VALUES
    ('Tamil Nadu', 'Erode', 'Perundurai Road', 'AutoCare Pro — Erode Central', 'Perundurai Road, Near Collectorate, Erode 638011', 'Mon–Sat: 8AM–7PM'),
    ('Tamil Nadu', 'Erode', 'NH-544 Bypass', 'AutoCare Express — Perundurai', 'NH-544 Bypass, Perundurai, Erode 638052', 'Mon–Sat: 9AM–6PM'),
    ('Tamil Nadu', 'Coimbatore', 'Avinashi Road / Hope College', 'AutoCare Pro — Avinashi Road', 'Avinashi Rd, Near Hope College, Coimbatore 641004', 'Mon–Sat: 8AM–8PM'),
    ('Tamil Nadu', 'Coimbatore', 'RS Puram', 'AutoCare Pro — RS Puram', 'DB Road, RS Puram, Coimbatore 641002', 'Mon–Sat: 9AM–7PM'),
    ('Tamil Nadu', 'Chennai', 'Anna Nagar', 'AutoCare Pro — Anna Nagar', '2nd Avenue, Anna Nagar, Chennai 600040', 'Mon–Sun: 8AM–8PM')
) AS l(state_name, district_name, area_name, name, address, timing)
JOIN public.states s ON s.name = l.state_name
JOIN public.districts d ON d.state_id = s.id AND d.name = l.district_name
LEFT JOIN public.areas a ON a.district_id = d.id AND a.name = l.area_name;
