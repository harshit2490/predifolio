# Stock Market Calculator - Complete Setup & Deployment Guide

This guide contains all the steps to push your project to GitHub, deploy it to Netlify, and configure Supabase database with the complete SQL schema.

---

## 1. Git & GitHub Setup Commands

Run these commands in your project root terminal (`c:\Users\harshit\Desktop\project\stock-market-calci`):

```bash
# 1. Initialize Git in your project
git init

# 2. Stage all project files (node_modules and .env are automatically ignored)
git add .

# 3. Create your initial commit
git commit -m "feat: Stock market calculator with live prices, predictions, drag-and-drop, and Supabase integration"

# 4. Set branch name to main
git branch -M main

# 5. Link to your GitHub repository (replace <your-username> with your actual GitHub username)
git remote add origin https://github.com/<your-username>/stock-market-calci.git

# 6. Push code to GitHub
git push -u origin main
```

> **Note for Future Updates**:
> Whenever you make changes in the future, just run:
> ```bash
> git add .
> git commit -m "your update message"
> git push
> ```

---

## 2. Netlify Deployment Steps (Using GitHub)

1. **Log in to Netlify**: Go to [app.netlify.com](https://app.netlify.com/) and click **"Log in with GitHub"**.
2. **Import Project**:
   - Click **"Add new site"** (top right) $\rightarrow$ select **"Import an existing project"**.
   - Select **GitHub** and authorize Netlify.
   - Choose your repository: `stock-market-calci`.
3. **Build Configuration**:
   - Netlify automatically detects the settings from your `netlify.toml`:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
4. **Set Environment Variables**:
   - On the deployment screen (or under **Site configuration $\rightarrow$ Environment variables**), add:
     - `VITE_SUPABASE_URL`: *(Your Supabase Project URL)*
     - `VITE_SUPABASE_ANON_KEY`: *(Your Supabase Anon / Public Key)*
5. **Deploy**:
   - Click **"Deploy site"** (or **"Deploy stock-market-calci"**).
   - Netlify will build and deploy the app in ~30 seconds and provide your live URL.
6. **Automatic Updates**:
   - Any new `git push` to your GitHub `main` branch will automatically trigger a new deployment on Netlify!

---

## 3. Supabase Setup & Environment Variables

### A. Create Project & Get Credentials
1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Click **"New project"** $\rightarrow$ select your organization and enter a name (e.g. `stock-market-calci`).
3. Set a strong database password and select region (e.g. `South Asia (Mumbai)`).
4. Once created, go to **Project Settings $\rightarrow$ API**:
   - Copy **Project URL**
   - Copy **anon public Key**
5. Create or update your `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```

---

## 4. Supabase SQL Schema & Multi-User Setup

### A. Quick Migration (If you already created the tables earlier)
If you already ran the previous schema in Supabase and want to activate separate dashboards for each user while keeping existing stocks under the admin account, run this in Supabase **SQL Editor**:

```sql
-- 1. Add user_id column with foreign key to app_users
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;

-- 2. Add index for fast per-user filtering
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);

-- 3. Link all existing stock cards to the admin user
UPDATE stocks 
SET user_id = (SELECT id FROM app_users WHERE username = 'admin' LIMIT 1) 
WHERE user_id IS NULL;
```

---

### B. Complete Full SQL Schema (For fresh database setups)
In your Supabase Dashboard, go to **SQL Editor** $\rightarrow$ click **"New query"**, paste the complete SQL script below, and click **"Run"**:

```sql
-- ==========================================================
-- Supabase Database Schema for Stock Market Calculator
-- File: src/supabaseSqlQuery/schema.sql
-- ==========================================================

-- 1. User Authentication Table (app_users)
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
```
