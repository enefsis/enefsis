-- Run this in the Supabase SQL editor
CREATE TABLE IF NOT EXISTS contract_logs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  language     text,
  plan         text,
  amount       integer,
  stands       integer,
  install_date date,
  generated_at timestamptz DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id)
);

-- Allow service-role reads/writes (used by admin client)
ALTER TABLE contract_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON contract_logs
  USING (true) WITH CHECK (true);
