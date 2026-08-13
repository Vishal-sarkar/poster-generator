-- SQL Script to set up event_settings table in Supabase
-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS event_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public reads" ON event_settings
  FOR SELECT TO public USING (true);

-- Allow public inserts
CREATE POLICY "Allow public inserts" ON event_settings
  FOR INSERT TO public WITH CHECK (true);

-- Allow public updates
CREATE POLICY "Allow public updates" ON event_settings
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Allow public deletes
CREATE POLICY "Allow public deletes" ON event_settings
  FOR DELETE TO public USING (true);


-- Insert initial settings for youth-day and independence-day events
INSERT INTO event_settings (event_id, event_name, release_date)
VALUES 
  ('youth-day', 'International Youth Day Virtual Challenge', NULL),
  ('independence-day', 'Independence Day Virtual Challenge', NULL)
ON CONFLICT (event_id) DO NOTHING;
