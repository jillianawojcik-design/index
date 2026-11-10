import "server-only";
import { db } from "./db";
import { getCurrentUser } from "./session";
import { normalizeContent, type PortfolioContent } from "./portfolio";

// Account data access. Functions named getMy…() work out *who* is asking from
// the session cookie and never accept a user id from the caller, so no page,
// form or URL can read someone else's private data.
//
// getPublishedPortfolio() is the only public lookup: it returns a portfolio
// only when its owner has published it, and only the portfolio content.

export type Portfolio = {
  id: string;
  slug: string;
  published: boolean;
  publishedAt: Date | null;
  targetRole: string;
  content: PortfolioContent;
  updatedAt: Date;
};

type Row = {
  id: string;
  slug: string | null;
  published: boolean;
  published_at: string | Date | null;
  target_role: string | null;
  content: unknown;
  updated_at: string | Date;
};

function toPortfolio(row: Row): Portfolio {
  return {
    id: row.id,
    slug: row.slug ?? "",
    published: row.published === true,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    targetRole: row.target_role ?? "",
    content: normalizeContent(typeof row.content === "string" ? JSON.parse(row.content) : row.content),
    updatedAt: new Date(row.updated_at),
  };
}

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

// The signed-in user's portfolio (draft or published), or null.
export async function getMyPortfolio(): Promise<Portfolio | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = (await db()`
    SELECT id, slug, published, published_at, target_role, content, updated_at
    FROM portfolios WHERE user_id = ${user.id}
    ORDER BY updated_at DESC LIMIT 1`) as Row[];
  return rows[0] ? toPortfolio(rows[0]) : null;
}

// Public: a published portfolio by its slug, or null (unpublished or missing).
export async function getPublishedPortfolio(slug: string): Promise<Portfolio | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const rows = (await db()`
    SELECT id, slug, published, published_at, target_role, content, updated_at
    FROM portfolios WHERE slug = ${slug} AND published = true
    LIMIT 1`) as Row[];
  return rows[0] ? toPortfolio(rows[0]) : null;
}
