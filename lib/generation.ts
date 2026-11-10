import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { slugify, type PortfolioContent } from "./portfolio";

// Cost controls for AI generation. Defaults can be changed with environment
// variables on Vercel without touching code.
function limit(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
export const limits = () => ({
  free: limit("GENERATION_LIMIT_FREE", 3), // per user per 24 h
  paid: limit("GENERATION_LIMIT_PAID", 10), // per user per 24 h
  global: limit("GENERATION_LIMIT_GLOBAL", 100), // whole site per 24 h
});

const STALE_MINUTES = 6; // a "running" request older than this is treated as dead

export type Usage = { used: number; limit: number; running: boolean };

export async function getUsage(userId: string, paid: boolean): Promise<Usage> {
  const [row] = (await db()`
    SELECT
      count(*) FILTER (WHERE status = 'succeeded' OR (status = 'running' AND created_at > now() - make_interval(mins => ${STALE_MINUTES})))::int AS used,
      bool_or(status = 'running' AND created_at > now() - make_interval(mins => ${STALE_MINUTES})) AS running
    FROM generation_requests
    WHERE user_id = ${userId} AND created_at > now() - interval '24 hours'`) as { used: number; running: boolean | null }[];
  const l = limits();
  return { used: row?.used ?? 0, limit: paid ? l.paid : l.free, running: row?.running === true };
}

export type StartResult = { ok: true; requestId: string } | { ok: false; reason: "running" | "user_limit" | "global_limit" | "too_many_failures" };

// Checks every limit and records a "running" request. Returns its id.
export async function startGeneration(userId: string, paid: boolean): Promise<StartResult> {
  const usage = await getUsage(userId, paid);
  if (usage.running) return { ok: false, reason: "running" };
  if (usage.used >= usage.limit) return { ok: false, reason: "user_limit" };

  const [{ failures, global_total }] = (await db()`
    SELECT
      (SELECT count(*)::int FROM generation_requests
        WHERE user_id = ${userId} AND status = 'failed' AND created_at > now() - interval '24 hours') AS failures,
      (SELECT count(*)::int FROM generation_requests
        WHERE created_at > now() - interval '24 hours') AS global_total`) as { failures: number; global_total: number }[];
  if (failures >= 10) return { ok: false, reason: "too_many_failures" };
  if (global_total >= limits().global) return { ok: false, reason: "global_limit" };

  const [row] = (await db()`
    INSERT INTO generation_requests (user_id) VALUES (${userId}) RETURNING id`) as { id: string }[];
  return { ok: true, requestId: row.id };
}

export async function finishGeneration(
  requestId: string,
  outcome: { ok: true; model: string; inputTokens: number; outputTokens: number } | { ok: false; errorCode: string; model?: string }
) {
  if (outcome.ok) {
    await db()`
      UPDATE generation_requests
      SET status = 'succeeded', model = ${outcome.model}, input_tokens = ${outcome.inputTokens},
          output_tokens = ${outcome.outputTokens}, finished_at = now()
      WHERE id = ${requestId}`;
  } else {
    await db()`
      UPDATE generation_requests
      SET status = 'failed', error_code = ${outcome.errorCode}, model = ${outcome.model ?? null}, finished_at = now()
      WHERE id = ${requestId}`;
  }
}

// Saves generated content as the user's portfolio. Regenerating replaces the
// content but keeps the existing public address and published state.
export async function savePortfolio(userId: string, content: PortfolioContent): Promise<{ slug: string }> {
  const slug = `${slugify(content.name, "portfolio")}-${randomBytes(3).toString("hex")}`;
  const title = content.name ? `${content.name} — Portfolio` : "Portfolio";
  const [row] = (await db()`
    INSERT INTO portfolios (user_id, title, content, slug, target_role)
    VALUES (${userId}, ${title}, ${JSON.stringify(content)}::jsonb, ${slug}, ${content.targetRole})
    ON CONFLICT (user_id) DO UPDATE
      SET title = EXCLUDED.title, content = EXCLUDED.content, target_role = EXCLUDED.target_role,
          slug = COALESCE(portfolios.slug, EXCLUDED.slug), updated_at = now()
    RETURNING slug`) as { slug: string }[];
  return { slug: row.slug };
}
