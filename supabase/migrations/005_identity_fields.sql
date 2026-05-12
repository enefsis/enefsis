ALTER TABLE client_pages
  ADD COLUMN IF NOT EXISTS restaurant_type  text,
  ADD COLUMN IF NOT EXISTS city             text,
  ADD COLUMN IF NOT EXISTS year_established text,
  ADD COLUMN IF NOT EXISTS rating           text,
  ADD COLUMN IF NOT EXISTS review_count     text,
  ADD COLUMN IF NOT EXISTS todays_specials  text,
  ADD COLUMN IF NOT EXISTS trip_advisor_url text,
  ADD COLUMN IF NOT EXISTS website_url      text;
