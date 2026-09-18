-- 002_storage_policies.sql
-- Setup Supabase Storage bucket for portfolio uploads

-- 1. Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-public', 'portfolio-public', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Allow public read access to portfolio-public bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-public');

-- Writes use the server-only service role, which bypasses RLS.
-- No INSERT, UPDATE, or DELETE policy is granted to browser roles.
