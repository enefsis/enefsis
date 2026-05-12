ALTER TABLE client_pages
  ADD COLUMN IF NOT EXISTS opening_hours       text,
  ADD COLUMN IF NOT EXISTS phone               text,
  ADD COLUMN IF NOT EXISTS address             text,
  ADD COLUMN IF NOT EXISTS wifi_name           text,
  ADD COLUMN IF NOT EXISTS wifi_password       text,
  ADD COLUMN IF NOT EXISTS call_waiter_enabled boolean DEFAULT false;
