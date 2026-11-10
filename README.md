# Folioform

AI-powered portfolio builder for students, recent graduates and early-career professionals.
Founded, designed & developed by Jillian Wojcik.

Next.js (App Router) · Neon Postgres · Claude API (Anthropic) · deployed on Vercel.

## What it does

1. Sign up / log in (secure sessions, Step 2).
2. Upload a resume (PDF or .docx), optional supporting reports and pasted text, and a target role.
3. Claude writes an employer-facing portfolio from those documents: intro, skills, experience,
   detailed project case studies, education, certifications and publications.
4. The portfolio is saved to the user's account as a draft. Uploaded files are never stored.
5. Preview it at `/preview`, edit any text at `/dashboard/edit`, then publish.
6. Published portfolios are public at `/p/<slug>` (no account needed), with a page per case study.

## Run it locally

Requires Node.js 20.9+.

```bash
npm install
npm run db:check     # confirm the database connection
npm run db:setup     # create/update tables + demo account (safe to re-run)
npm run dev          # http://localhost:3000
```

## Environment variables

See `.env.example`. Locally they go in `.env.local`; on Vercel in Settings → Environment Variables.

| Variable                  | Where          | Purpose                                         |
| ------------------------- | -------------- | ----------------------------------------------- |
| `DATABASE_URL`            | local + Vercel | Neon connection string                          |
| `ANTHROPIC_API_KEY`       | local + Vercel | Claude API key (server-side only)               |
| `DEMO_PASSWORD`           | local only     | Password `db:setup` gives demo@demo.com         |
| `ANTHROPIC_MODEL` etc.    | optional       | Model, effort and daily generation limits       |

## AI generation (`app/api/generate/route.ts`)

- Model: `claude-sonnet-5-5` via the Messages API (plain `fetch`, no SDK), `anthropic-version: 2026-10-21`.
- PDFs are sent to Claude natively as `document` blocks; .docx files are converted to text on the
  server (`lib/documents.ts`, no extra packages).
- Output uses structured outputs (`output_config.format` + `lib/ai/schema.ts`), so the response is
  always valid JSON in the portfolio shape. `lib/portfolio.ts → normalizeContent()` then enforces
  length limits and strips unsafe links before anything is saved.
- `lib/ai/prompt.ts` contains the accuracy rules: no invented metrics, qualifications, methods or results.
- Cost controls (`lib/generation.ts`): per-user daily limits (3 free / 10 paid), a site-wide daily cap,
  one generation at a time per user, and a cap on repeated failures.
- Limits: 4 MB per file, 4.3 MB total (Vercel's request limit is 4.5 MB), 2 supporting files,
  30,000 characters of pasted text. Functions may run up to 300 s.

## Security

- Passwords: salted scrypt. Sessions: random token in an httpOnly/Secure/SameSite=Lax cookie; only its hash is stored.
- Every private read/write derives the user from the session (`lib/account.ts`, `app/actions/*`); no user ids in URLs or forms.
- Public pages (`/p/...`) only return portfolios with `published = true`, and never show the private suggestions.
- API keys are only read on the server. Uploaded documents are processed in memory and discarded.

## Database (`db/schema.sql`)

`users`, `sessions`, `login_attempts`, `purchases` (paid access, used by Stripe next),
`portfolios` (one per user: `content` JSON, `slug`, `published`), `generation_requests` (usage log).

## Project layout

```
app/
  page.tsx                      homepage (unchanged)
  login/, signup/               accounts
  dashboard/page.tsx            workspace: generate, status, publish, share link, suggestions, usage
  dashboard/GenerateForm.tsx    upload form + progress
  dashboard/edit/               text editor
  preview/                      owner's private preview (+ /preview/<project>)
  p/[slug]/                     public portfolio (+ /p/<slug>/<project>)
  api/generate/route.ts         AI generation endpoint
  api/health/route.ts           database check
  actions/auth.ts               signup / login / logout
  actions/portfolio.ts          publish / unpublish / save edits
  components/site/              employer-facing portfolio design
  globals.css, site.css         Folioform styles; portfolio-site styles (scoped)
lib/
  ai/claude.ts, ai/prompt.ts, ai/schema.ts
  documents.ts, portfolio.ts, generation.ts, account.ts, session.ts, password.ts, db.ts
scripts/
  db-check.mjs, db-setup.ts, demo-data.ts
```

## Roadmap

1. ✅ Next.js port  2. ✅ Accounts  3. ✅ AI portfolio generator, preview, editing, publishing
4. Stripe Checkout with server-side verification  5. Production launch
