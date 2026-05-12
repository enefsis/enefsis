-- Create client-assets bucket with public read
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-assets', 'client-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public SELECT (reads) on all objects in client-assets
CREATE POLICY IF NOT EXISTS "client-assets public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-assets');

-- Allow authenticated users to INSERT/UPDATE their own folder
CREATE POLICY IF NOT EXISTS "client-assets owner write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text);
