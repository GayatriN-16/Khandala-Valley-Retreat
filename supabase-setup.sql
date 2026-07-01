-- Supabase Table Setup and RLS Policies for Khandala Valley Retreat

-- 1. Create tables if they do not exist
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_name TEXT,
  check_in TEXT,
  check_out TEXT,
  guests INTEGER,
  status TEXT DEFAULT 'Confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  rating INTEGER,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Configure Row Level Security (RLS)
-- NOTE: We are enabling anonymous inserts/selects for the prototype.
-- In a production app, you should restrict access to authenticated users!

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on bookings" 
ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous select on bookings" 
ON bookings FOR SELECT TO anon, authenticated USING (true);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on contacts" 
ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous select on contacts" 
ON contacts FOR SELECT TO anon, authenticated USING (true);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on reviews" 
ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous select on reviews" 
ON reviews FOR SELECT TO anon, authenticated USING (true);

-- Admin Users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on admin_users" 
ON admin_users FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous select on admin_users" 
ON admin_users FOR SELECT TO anon, authenticated USING (true);
