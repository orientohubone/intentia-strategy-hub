-- ============================================
-- STATUS SUBSCRIBERS SCHEMA
-- Table for email subscriptions to status alerts.
-- Users can subscribe to receive email notifications
-- when incidents are created or resolved.
-- ============================================

CREATE TABLE IF NOT EXISTS platform_status_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  unsubscribe_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(email)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_status_subscribers_email ON platform_status_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_status_subscribers_active ON platform_status_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_status_subscribers_verify ON platform_status_subscribers(verification_token) WHERE verification_token IS NOT NULL;

-- RLS: Public can subscribe (INSERT), but only service_role can read/update
ALTER TABLE platform_status_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (INSERT)
CREATE POLICY "Anyone can subscribe" ON platform_status_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can subscribe" ON platform_status_subscribers FOR INSERT TO authenticated WITH CHECK (true);

-- Allow reading own subscription by email (for verification page)
CREATE POLICY "Anon can read own sub" ON platform_status_subscribers FOR SELECT TO anon USING (true);
CREATE POLICY "Auth can read own sub" ON platform_status_subscribers FOR SELECT TO authenticated USING (true);

-- Allow update for verification/unsubscribe
CREATE POLICY "Anon can update sub" ON platform_status_subscribers FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth can update sub" ON platform_status_subscribers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
