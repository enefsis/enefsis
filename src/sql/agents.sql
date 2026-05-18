-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name       text NOT NULL,
  email           text NOT NULL UNIQUE,
  phone           text,
  territory       text,
  commission_rate numeric(5,2) NOT NULL DEFAULT 20.00,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes           text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON agents USING (true) WITH CHECK (true);

-- Link clients to their referring agent
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES agents(id) ON DELETE SET NULL;

-- Also track agent assignment on the subscription row
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES agents(id) ON DELETE SET NULL;
