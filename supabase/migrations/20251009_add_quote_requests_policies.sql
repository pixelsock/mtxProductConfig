-- Enable Row Level Security on quote_requests table
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert quote requests (public submissions)
-- This policy allows anonymous quote submissions through the public form
CREATE POLICY "Allow public quote request submissions" ON quote_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view all quote requests
-- This is useful for admin/staff to view submitted quotes
CREATE POLICY "Allow authenticated users to view quote requests" ON quote_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to update quote requests
-- This is useful for admin/staff to update status
CREATE POLICY "Allow authenticated users to update quote requests" ON quote_requests
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow service role full access (for Server Actions)
-- This ensures Server Actions can always insert regardless of auth state
CREATE POLICY "Allow service role full access to quote requests" ON quote_requests
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
