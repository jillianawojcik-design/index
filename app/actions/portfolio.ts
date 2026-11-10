"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { normalizeContent } from "@/lib/portfolio";

// Publishing and editing. Each action finds the user from the session and
// only ever updates the row WHERE user_id = that user.

export async function publishPortfolio() {
  const user = await getCurrentUser();
  if (!user) return;
  await db()`
    UPDATE portfolios SET published = true, published_at = COALESCE(published_at, now())
    WHERE user_id = ${user.id}`;
  revalidatePath("/dashboard");
  revalidatePath("/preview");
}

export async function unpublishPortfolio() {
  const user = await getCurrentUser();
  if (!user) return;
  await db()`UPDATE portfolios SET published = false, published_at = NULL WHERE user_id = ${user.id}`;
  revalidatePath("/dashboard");
  revalidatePath("/preview");
}

export type SaveState = { ok: boolean; message: string; savedAt?: number } | undefined;

export async function saveEdits(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has ended. Please log in again." };

  const raw = String(formData.get("content") ?? "");
  if (raw.length > 400_000) return { ok: false, message: "That portfolio is too large to save." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Couldn't read your changes. Please try again." };
  }
  const content = normalizeContent(parsed);
  if (!content.name) return { ok: false, message: "Your name can't be empty." };

  try {
    const rows = (await db()`
      UPDATE portfolios
      SET content = ${JSON.stringify(content)}::jsonb, title = ${`${content.name} — Portfolio`},
          target_role = ${content.targetRole}, updated_at = now()
      WHERE user_id = ${user.id}
      RETURNING id`) as { id: string }[];
    if (!rows[0]) return { ok: false, message: "Generate a portfolio first." };
  } catch (err) {
    console.error("Saving edits failed:", err);
    return { ok: false, message: "Something went wrong saving. Please try again." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/preview");
  return { ok: true, message: "Saved", savedAt: Date.now() };
}
