-- =====================================================
-- STORAGE SETUP FOR AVATARS
-- =====================================================

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for avatars bucket
-- Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Everyone can read avatars (public access)
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

-- 1. Execute this SQL in the Supabase SQL Editor
-- 2. Go to Storage section in Supabase Dashboard
-- 3. Verify the 'avatars' bucket was created
-- 4. Test upload functionality

-- The bucket will be accessible at:
-- https://[PROJECT_REF].supabase.co/storage/v1/object/public/avatars/[filename]
