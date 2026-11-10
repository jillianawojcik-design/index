import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";

// How sessions work:
// 1. On signup/login we create a random 256-bit token.
// 2. The browser gets the token in an httpOnly cookie (JavaScript on the page
//    can't read it), marked Secure on HTTPS and SameSite=Lax.
// 3. The database stores only the token's SHA-256 hash, with an expiry date.
// 4. Each request looks the hash up to find the signed-in user.
// Logging out deletes the row, so the cookie stops working immediately.

export const SESSION_COOKIE = "ff_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  // Tidy up this user's expired sessions while we're here.
  await db()`DELETE FROM sessions WHERE user_id = ${userId} AND expires_at < now()`;
  await db()`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expires.toISOString()})`;

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

// Returns the signed-in user, or null. Wrapped in cache() so several calls
// during one page render only hit the database once.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db()`
    SELECT u.id, u.email, u.name, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${hashToken(token)} AND s.expires_at > now()`;

  const row = (rows as Record<string, unknown>[])[0];
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    createdAt: new Date(row.created_at as string | Date),
  };
});

export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  // Clear the cookie first so the browser is signed out even if the database is unreachable.
  store.delete(SESSION_COOKIE);
  if (token) {
    await db()`DELETE FROM sessions WHERE id = ${hashToken(token)}`;
  }
}
