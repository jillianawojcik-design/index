// Loads .env.local and .env into process.env for command-line scripts
// (Next.js does this automatically for the app itself). Existing variables
// win, then .env.local, then .env — the same order Next.js uses.
import { existsSync, readFileSync } from "node:fs";

export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, raw] = match;
      const value = raw.replace(/^(['"])(.*)\1$/, "$2");
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
