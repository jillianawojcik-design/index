# Folioform

AI-powered portfolio builder for students, recent graduates and early-career professionals.
Founded, designed & developed by Jillian Wojcik.

Built with Next.js (App Router) and deployed on Vercel.

## Run it locally

Requires Node.js 20.9 or newer (https://nodejs.org).

```bash
npm install      # first time only
npm run dev      # start the dev server → http://localhost:3000
npm run build    # optional: check that the production build succeeds
```

## Database (Neon Postgres)

The app reads its connection string from the `DATABASE_URL` environment variable.

- Local: `neon init` writes it to `.env`, or you can put it in `.env.local` yourself.
- Vercel: Settings → Environment Variables → `DATABASE_URL` (Preview only for now).

Check the connection:

```bash
npm run db:check                         # from your computer
https://<your-preview-url>/api/health    # from a Vercel deployment
```

`/api/health` returns `{"ok":true,"database":"connected"}` when it works,
`"not_configured"` if `DATABASE_URL` is missing, or `"unreachable"` if the value is wrong.

## Project layout

```
app/
  layout.tsx            page shell: <html>, fonts, metadata
  page.tsx              the homepage (ported from the original index.html)
  globals.css           all site styles (moved unchanged from index.html)
  api/health/route.ts   GET /api/health — database connection check
  components/
    SiteNav.tsx         top nav + mobile menu (client component)
    Pricing.tsx         pricing section + one-time/monthly toggle (client component)
lib/db.ts               Neon database client (server-only)
scripts/db-check.mjs    `npm run db:check`
vercel.json             tells Vercel to build this as a Next.js app
.env.example            list of environment variables (no real values)
```

## Secrets

API keys, database URLs and Stripe secrets go in `.env.local` on your computer and in
Vercel → Settings → Environment Variables for deployments. `.env*` files are git-ignored,
so they are never committed. Never give a secret a `NEXT_PUBLIC_` prefix, because that sends it to the browser.

## Roadmap

1. ✅ Port the static homepage to Next.js (no visual changes)
2. Neon Postgres connection (✅ check in place) → accounts (register, login, logout)
3. Resume upload / paste + AI portfolio generator
4. Saved portfolios per user
5. Stripe Checkout with server-side verification and paid access
6. Demo account (demo@demo.com) with sample data
7. Production deployment
