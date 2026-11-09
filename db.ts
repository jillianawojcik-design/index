import "server-only";
import { neon } from "@neondatabase/serverless";

// Neon's serverless driver sends each query over HTTPS, which suits Vercel's
// short-lived functions (no connection pool to manage).
//
// Use it as a tagged template:  await db()`SELECT * FROM users WHERE id = ${id}`
// Values in ${...} are sent as query parameters, never pasted into the SQL
// text, so this is safe from SQL injection.

let client: ReturnType<typeof neon> | null = null;

export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (local) or to Vercel → Settings → Environment Variables (deployed)."
      );
    }
    client = neon(url);
  }
  return client;
}
