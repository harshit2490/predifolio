-- ==========================================================
-- Supabase Database Schema for Stock Market Calculator
-- File: src/supabaseSqlQuery/schema.sql
-- ==========================================================

-- ==========================================================
-- ⚡ QUICK MIGRATION (If you already have existing tables)
-- Copy and run these 3 lines in Supabase SQL Editor:
-- ==========================================================
-- ALTER TABLE stocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;
-- CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);
-- UPDATE stocks SET user_id = (SELECT id FROM app_users WHERE username = 'admin' LIMIT 1) WHERE user_id IS NULL;
-- ==========================================================

-- 1. User Authentication Table (app_users)
-- Created first so stocks table can reference user_id foreign key
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns and indexes exist if table was created earlier
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_email ON app_users(lower(email)) WHERE email IS NOT NULL;

-- Enable Row Level Security (RLS) on app_users
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading user for login verification
DROP POLICY IF EXISTS "Allow public select for login" ON app_users;
CREATE POLICY "Allow public select for login" ON app_users
  FOR SELECT
  USING (true);

-- Policy: Allow all operations (insert for signup, update for profile, delete)
DROP POLICY IF EXISTS "Allow all operations on app_users" ON app_users;
CREATE POLICY "Allow all operations on app_users" ON app_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert or update default admin account
INSERT INTO app_users (name, username, email, password, role)
VALUES ('Harshit', 'admin', 'admin@stockcalci.com', 'Harshit2490@', 'admin')
ON CONFLICT (username) DO UPDATE
SET name = COALESCE(app_users.name, EXCLUDED.name),
    email = COALESCE(app_users.email, EXCLUDED.email);

-- ==========================================================
-- 2. Stocks Table (User-isolated Portfolios)
-- ==========================================================
CREATE TABLE IF NOT EXISTS stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
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

-- Ensure user_id and sell_predictions columns exist if table was created earlier
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sell_predictions JSONB DEFAULT '[]'::jsonb;

-- Assign any existing unassigned stocks to the admin user
UPDATE stocks
SET user_id = (SELECT id FROM app_users WHERE username = 'admin' LIMIT 1)
WHERE user_id IS NULL;

-- Enable Row Level Security (RLS) on stocks
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (Insert, Select, Update, Delete)
DROP POLICY IF EXISTS "Allow all operations" ON stocks;
CREATE POLICY "Allow all operations" ON stocks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for fast querying, user-filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_stocks_created_at ON stocks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_buy_date ON stocks(buy_date DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON stocks(stock_name);
