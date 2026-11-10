-- Folioform database schema.
-- Safe to run more than once: every statement uses IF NOT EXISTS.
-- Apply it with `npm run db:setup` (recommended) or paste it into Neon Console → SQL Editor.

-- ACCOUNTS ---------------------------------------------------------------
-- Emails are stored lowercase so "Jill@X.com" and "jill@x.com" are one account.
-- Passwords are never stored, only a salted scrypt hash.
CREATE TABLE IF NOT EXISTS users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL UNIQUE CHECK (email = lower(email)),
  name          text        NOT NULL,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- SESSIONS ---------------------------------------------------------------
-- One row per signed-in browser. The cookie holds a random token; this table
-- holds only its SHA-256 hash, so a leaked database can't be used to log in.
CREATE TABLE IF NOT EXISTS sessions (
  id         text        PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

-- FAILED LOGINS ----------------------------------------------------------
-- Used to slow down password guessing: too many failures for one email in
-- 15 minutes temporarily blocks further attempts.
CREATE TABLE IF NOT EXISTS login_attempts (
  email        text        NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_email_idx ON login_attempts (email, attempted_at);

-- PAID ACCESS ------------------------------------------------------------
-- A user has paid access when they have a 'paid' purchase. Stripe (Step 5)
-- will add rows here after verifying payment on the server; 'seed' rows are
-- created by the setup script (the demo account).
CREATE TABLE IF NOT EXISTS purchases (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan              text        NOT NULL CHECK (plan IN ('instant', 'guided', 'plus', 'pro')),
  status            text        NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
  source            text        NOT NULL CHECK (source IN ('stripe', 'seed')),
  stripe_session_id text        UNIQUE,
  amount_cents      integer     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases (user_id);

-- PORTFOLIOS -------------------------------------------------------------
-- Generated portfolio content (intro, skills, experience, projects) as JSON.
-- The AI generator (Step 3) writes the same shape.
CREATE TABLE IF NOT EXISTS portfolios (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  content    jsonb       NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolios_user_id_idx ON portfolios (user_id);
