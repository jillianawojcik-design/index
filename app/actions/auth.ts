"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

// Server actions: these run only on the server. Next.js checks that each
// request came from this site (CSRF protection) before running them.

export type AuthState =
  | { error: string; fields: { name?: string; email?: string } }
  | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;
const MAX_FAILED_LOGINS = 10; // per email, per 15 minutes
const SERVER_ERROR = "Something went wrong on our side. Please try again in a moment.";

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { name, email, password } = readForm(formData);
  const fields = { name, email };

  if (!name || name.length > 100) return { error: "Please enter your name.", fields };
  if (email.length > 254 || !EMAIL_RE.test(email))
    return { error: "Please enter a valid email address.", fields };
  if (password.length < MIN_PASSWORD)
    return { error: `Password must be at least ${MIN_PASSWORD} characters.`, fields };
  if (password.length > MAX_PASSWORD)
    return { error: `Password must be at most ${MAX_PASSWORD} characters.`, fields };

  try {
    const passwordHash = await hashPassword(password);
    const rows = (await db()`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email}, ${name}, ${passwordHash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id`) as { id: string }[];

    if (!rows[0]) {
      return { error: "An account with this email already exists. Try logging in instead.", fields };
    }
    await createSession(rows[0].id);
  } catch (err) {
    console.error("Signup failed:", err);
    return { error: SERVER_ERROR, fields };
  }
  redirect("/dashboard"); // must be outside try/catch (it works by throwing)
}

// Used when the email doesn't exist, so a wrong email takes as long as a
// wrong password and response time doesn't reveal which accounts exist.
let dummyHash: Promise<string> | undefined;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  const fields = { email };
  const wrongCredentials = { error: "Email or password is incorrect.", fields };

  if (!email || !password || password.length > MAX_PASSWORD) return wrongCredentials;

  try {
    const [{ failures }] = (await db()`
      SELECT count(*)::int AS failures FROM login_attempts
      WHERE email = ${email} AND attempted_at > now() - interval '15 minutes'`) as {
      failures: number;
    }[];
    if (failures >= MAX_FAILED_LOGINS) {
      return { error: "Too many failed attempts. Please wait 15 minutes and try again.", fields };
    }

    const rows = (await db()`
      SELECT id, password_hash FROM users WHERE email = ${email}`) as {
      id: string;
      password_hash: string;
    }[];
    const user = rows[0];

    let valid: boolean;
    if (user) {
      valid = await verifyPassword(password, user.password_hash);
    } else {
      dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
      await verifyPassword(password, await dummyHash);
      valid = false;
    }

    if (!user || !valid) {
      await db()`INSERT INTO login_attempts (email) VALUES (${email})`;
      await db()`DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 day'`;
      return wrongCredentials;
    }

    await db()`DELETE FROM login_attempts WHERE email = ${email}`;
    await createSession(user.id);
  } catch (err) {
    console.error("Login failed:", err);
    return { error: SERVER_ERROR, fields };
  }
  redirect("/dashboard");
}

export async function logout() {
  try {
    await deleteSession();
  } catch (err) {
    console.error("Logout failed:", err);
  }
  redirect("/");
}
