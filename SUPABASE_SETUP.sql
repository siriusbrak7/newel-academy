-- NEWEL ACADEMY SUPABASE SCHEMA
-- Copy and paste this into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the app_data table for key-value syncing
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy that allows all users (using the anon key) to read and write
-- NOTE: In a production environment, you would restrict this to authenticated users only.
CREATE POLICY "Public Read/Write for Demo" ON app_data
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 4. Create a storage bucket for materials (optional but recommended for storage functionality)
-- Note: You usually create this via the Supabase Dashboard UI under "Storage".
-- Name the bucket: "materials"
-- Set it to "Public" if you want public URLs.
