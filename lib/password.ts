// Uses Node's crypto module, so it can only run on the server. (No
// "server-only" marker here because the db:setup script also uses it to hash
// the demo account's password.)
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Passwords are hashed with scrypt (built into Node, no extra package), using
// a random 16-byte salt per password. The stored string records its own
// parameters, so they can be strengthened later without breaking old hashes:
//   scrypt$N$r$p$<salt base64>$<hash base64>

const N = 32768; // CPU/memory cost (2^15) — ~32 MB per hash
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, opts, (err, key) =>
      err ? reject(err) : resolve(key)
    )
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, { N, r: R, p: P, maxmem: MAX_MEMORY });
  return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY,
  });
  // Constant-time comparison so response timing doesn't leak how close a guess was.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
