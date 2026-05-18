-- Commission records: one row per agent per month
CREATE TABLE IF NOT EXISTS agent_commissions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id   uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  month      date NOT NULL,           -- first day of the month e.g. 2026-05-01
  amount     numeric(10,2) NOT NULL DEFAULT 0,
  status     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at    timestamptz,
  notes      text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, month)
);

ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON agent_commissions USING (true) WITH CHECK (true);
