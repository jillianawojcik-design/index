// Checks that this project can reach your Neon database.
// Usage: npm run db:check
// Prints the host and database name, never the password.
import { neon } from "@neondatabase/serverless";
import { loadEnv } from "./load-env.mjs";

loadEnv();
const url = process.env.DATABASE_URL;

if (!url) {
  console.error(`✗ DATABASE_URL is not set.

  Either run Neon's setup in this folder:
    neon init -y --agent claude-code --org-id <your org id> --project-id <your project id>
  or create a file named .env.local here containing:
    DATABASE_URL=<connection string from Neon Console → Connect>`);
  process.exit(1);
}

let host = "(unreadable)";
try {
  host = new URL(url).host;
} catch {
  console.error("✗ DATABASE_URL doesn't look like a connection string. It should start with postgresql://");
  process.exit(1);
}

try {
  const started = Date.now();
  const [row] = await neon(url)`
    SELECT current_database() AS database, current_user AS role, version() AS version`;
  console.log(`✓ Connected to Neon in ${Date.now() - started} ms
  host:      ${host}
  database:  ${row.database}
  role:      ${row.role}
  server:    ${String(row.version).split(" ").slice(0, 2).join(" ")}`);
  if (!host.includes("-pooler")) {
    console.log(
      "\n  Tip: Neon recommends the pooled connection string (host contains \"-pooler\") for Vercel."
    );
  }
} catch (err) {
  console.error(`✗ Could not connect to ${host}
  ${err instanceof Error ? err.message : err}

  Check that the connection string was copied in full (including the password)
  and that the Neon project is not deleted or suspended.`);
  process.exit(1);
}
