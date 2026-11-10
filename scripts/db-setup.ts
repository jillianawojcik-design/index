// Sets up the database: creates/updates all tables, then creates the demo account.
// Usage: npm run db:setup
//
// Reads from .env.local / .env (never from the code):
//   DATABASE_URL    your Neon connection string (required)
//   DEMO_PASSWORD   password for demo@demo.com (optional; demo account is skipped if unset)
//
// Safe to run again: tables use IF NOT EXISTS, and the demo account is
// updated rather than duplicated.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { loadEnv } from "./load-env.mjs";
import { hashPassword } from "../lib/password";
import { DEMO_PORTFOLIO, DEMO_SLUG } from "./demo-data";

const DEMO_EMAIL = "demo@demo.com";
const DEMO_NAME = "Jordan Rivera"; // fictional sample student

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL is not set. Add it to .env.local (see README), then run this again.");
    process.exit(1);
  }
  const sql = neon(url);
  console.log(`Connecting to ${new URL(url).host} …`);

  // 1. Tables. Neon's HTTP driver runs one statement per request.
  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
  const statements = schema
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  console.log(`✓ Tables ready (${statements.length} statements applied)`);

  // 2. Demo account.
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword) {
    console.log("• DEMO_PASSWORD is not set, so the demo account was skipped.");
    return;
  }
  if (demoPassword.length < 8) {
    console.error("✗ DEMO_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(demoPassword);
  const [user] = (await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES (${DEMO_EMAIL}, ${DEMO_NAME}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
    RETURNING id`) as { id: string }[];

  // Full paid access: a Pro purchase marked as seeded (not from Stripe).
  await sql`
    INSERT INTO purchases (user_id, plan, status, source, amount_cents)
    SELECT ${user.id}, 'pro', 'paid', 'seed', 0
    WHERE NOT EXISTS (SELECT 1 FROM purchases WHERE user_id = ${user.id} AND source = 'seed')`;

  // Sample portfolio, published at /p/jordan-rivera (replaced on every run so it stays current).
  await sql`DELETE FROM portfolios WHERE user_id = ${user.id} OR slug = ${DEMO_SLUG}`;
  await sql`
    INSERT INTO portfolios (user_id, title, content, slug, target_role, published, published_at)
    VALUES (${user.id}, ${`${DEMO_NAME} — Portfolio`}, ${JSON.stringify(DEMO_PORTFOLIO)}::jsonb,
            ${DEMO_SLUG}, ${DEMO_PORTFOLIO.targetRole}, true, now())`;

  console.log(`✓ Demo account ready: ${DEMO_EMAIL} (Folioform Pro, published at /p/${DEMO_SLUG})`);
}

main().catch((err) => {
  console.error("✗ Setup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
