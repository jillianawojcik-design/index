import "server-only";
import { db } from "./db";
import { getCurrentUser } from "./session";
import type { PortfolioContent } from "./portfolio";

// Account data access. Every function here works out *who* is asking from
// the session cookie itself and never accepts a user id from the caller,
// so no page, form or URL can ask for someone else's data.

export type Portfolio = {
  id: string;
  title: string;
  content: PortfolioContent;
  updatedAt: Date;
};

// Highest plan the signed-in user has paid for, or null for free accounts.
export async function getMyPlan(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = (await db()`
    SELECT plan FROM purchases
    WHERE user_id = ${user.id} AND status = 'paid'
    ORDER BY CASE plan WHEN 'pro' THEN 4 WHEN 'plus' THEN 3 WHEN 'guided' THEN 2 ELSE 1 END DESC
    LIMIT 1`) as { plan: string }[];
  return rows[0]?.plan ?? null;
}

// The signed-in user's most recently updated portfolio, or null.
export async function getMyPortfolio(): Promise<Portfolio | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = (await db()`
    SELECT id, title, content, updated_at FROM portfolios
    WHERE user_id = ${user.id}
    ORDER BY updated_at DESC
    LIMIT 1`) as { id: string; title: string; content: unknown; updated_at: string | Date }[];
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    content: (typeof row.content === "string" ? JSON.parse(row.content) : row.content) as PortfolioContent,
    updatedAt: new Date(row.updated_at),
  };
}
