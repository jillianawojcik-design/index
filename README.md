# Folioform

AI-powered portfolio builder for students, recent graduates and early-career professionals.
Founded, designed & developed by Jillian Wojcik.

Built with Next.js (App Router), Neon Postgres, and deployed on Vercel.

## Run it locally

Requires Node.js 20.9 or newer (https://nodejs.org).

```bash
npm install          # first time only
npm run db:check     # confirm the database connection
npm run db:setup     # create/update tables + the demo account (safe to re-run)
npm run dev          # http://localhost:3000
```

## Environment variables

Real values live in `.env.local` (or `.env`, which `neon init` writes) on your computer and in
Vercel → Settings → Environment Variables for deployments. Both files are git-ignored.
See `.env.example` for the full list.

| Variable        | Where                | Purpose                                              |
| --------------- | -------------------- | ---------------------------------------------------- |
| `DATABASE_URL`  | local + Vercel       | Neon connection string (pooled)                      |
| `DEMO_PASSWORD` | local only           | Password `db:setup` gives demo@demo.com (hashed)     |

Never give a secret a `NEXT_PUBLIC_` prefix — that sends it to the browser.

## Accounts and security

- **Passwords**: scrypt with a random salt per password (`lib/password.ts`). Plain passwords are never stored or logged.
- **Sessions**: a random 256-bit token in an `httpOnly`, `Secure`, `SameSite=Lax` cookie that lasts 30 days.
  The database stores only the token's SHA-256 hash (`lib/session.ts`). Logging out deletes the session row.
- **Your data only**: account data is read through `lib/account.ts`, which works out the user from the
  session cookie and never accepts a user id from a page, form or URL.
- **Password guessing**: 10 failed logins for one email within 15 minutes blocks further attempts for that email.
- **Forms**: signup/login/logout are Next.js server actions, which reject cross-site requests.
- **Paid access**: a user has paid access when the `purchases` table has a `paid` row for them.
  Stripe (Step 5) will add these rows after verifying payment on the server.

## Database tables (`db/schema.sql`)

`users`, `sessions`, `login_attempts`, `purchases`, `portfolios`.

## Project layout

```
app/
  page.tsx                  homepage (ported unchanged from the original index.html)
  login/, signup/           account pages
  dashboard/page.tsx        signed-in dashboard (redirects to /login when signed out)
  actions/auth.ts           signup, login, logout (server actions)
  api/health/route.ts       GET /api/health — database connection check
  components/               SiteNav, Pricing, AuthShell, AppHeader, PortfolioView
  globals.css               homepage styles (unchanged) + account page styles at the end
lib/
  db.ts                     Neon client (server-only)
  password.ts               password hashing
  session.ts                sessions and getCurrentUser()
  account.ts                the signed-in user's plan and portfolio
  portfolio.ts              portfolio content shape
db/schema.sql               all tables
scripts/
  db-check.mjs              npm run db:check
  db-setup.ts               npm run db:setup (tables + demo account)
  demo-data.ts              the demo account's sample portfolio
```

## Roadmap

1. ✅ Port the static homepage to Next.js
2. ✅ Neon Postgres + accounts (register, login, logout, sessions, dashboard, demo account)
3. Resume upload / paste + AI portfolio generator
4. Saved portfolios per user (editing)
5. Stripe Checkout with server-side verification and paid access
6. Production deployment
