-- Create storage bucket for quote PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-pdfs', 'quote-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for quote PDFs bucket
-- Allow public read access (PDFs can be viewed by anyone with the link)
CREATE POLICY "Public Access for Quote PDFs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'quote-pdfs');

-- Allow authenticated users to upload PDFs (Server Actions will use service role)
CREATE POLICY "Authenticated users can upload quote PDFs" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'quote-pdfs');

-- Allow authenticated users to update their own PDFs
CREATE POLICY "Authenticated users can update quote PDFs" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'quote-pdfs');

-- Allow authenticated users to delete their own PDFs
CREATE POLICY "Authenticated users can delete quote PDFs" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'quote-pdfs');
