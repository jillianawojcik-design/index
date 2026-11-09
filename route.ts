import { db } from "@/lib/db";

// GET /api/health — confirms the deployed app can reach the database.
// Reports only a status word, never connection details or error text,
// so it's safe to leave public.
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { ok: false, database: "not_configured" },
      { status: 503, headers: noStore }
    );
  }

  const started = Date.now();
  try {
    await db()`SELECT 1`;
    return Response.json(
      { ok: true, database: "connected", latencyMs: Date.now() - started },
      { headers: noStore }
    );
  } catch (err) {
    // Full error goes to Vercel's function logs, not to the browser.
    console.error("Database health check failed:", err);
    return Response.json({ ok: false, database: "unreachable" }, { status: 503, headers: noStore });
  }
}
