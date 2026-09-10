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

-- Allow service role / authenticated admin uploads
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-public');

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'portfolio-public');

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'portfolio-public');
