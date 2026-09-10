-- ==========================================================
-- Supabase Database Schema for Stock Market Calculator
-- File: src/supabaseSqlQuery/schema.sql
-- ==========================================================

-- 1. Create stocks table (if not exists)
CREATE TABLE IF NOT EXISTS stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_name TEXT NOT NULL,
  buy_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buy_price NUMERIC(12,4) NOT NULL,
  invested_amount NUMERIC(14,2) NOT NULL,
  sell_prediction_price NUMERIC(12,4),
  sell_predictions JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If table was already created earlier, ensure sell_predictions column exists
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sell_predictions JSONB DEFAULT '[]'::jsonb;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy: Allow all operations (Insert, Select, Update, Delete)
-- Drop existing policy first if re-running to avoid duplicate policy error
DROP POLICY IF EXISTS "Allow all operations" ON stocks;

CREATE POLICY "Allow all operations" ON stocks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Optional: Indexes for faster query and sorting
CREATE INDEX IF NOT EXISTS idx_stocks_created_at ON stocks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_buy_date ON stocks(buy_date DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON stocks(stock_name);

-- ==========================================================
-- 6. User Authentication Table (app_users)
-- ==========================================================
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading user for login verification
DROP POLICY IF EXISTS "Allow public select for login" ON app_users;
CREATE POLICY "Allow public select for login" ON app_users
  FOR SELECT
  USING (true);

-- Policy: Allow all operations (insert, update, delete)
DROP POLICY IF EXISTS "Allow all operations on app_users" ON app_users;
CREATE POLICY "Allow all operations on app_users" ON app_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default admin account (will not overwrite if already exists)
INSERT INTO app_users (username, password, role)
VALUES ('admin', 'Harshit2490@', 'admin')
ON CONFLICT (username) DO NOTHING;

