import "server-only";

// Minimal Claude Messages API client (plain fetch, no SDK).
// Docs: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
// The API key is read from ANTHROPIC_API_KEY on the server and never sent to the browser.

export const DEFAULT_MODEL = "claude-sonnet-5-5";
const API_VERSION = "2026-10-21";

export type AIErrorCode =
  | "not_configured"
  | "rate_limited"
  | "overloaded"
  | "timeout"
  | "too_large"
  | "refused"
  | "incomplete"
  | "bad_output"
  | "upstream";

export class AIError extends Error {
  constructor(public code: AIErrorCode, message: string) {
    super(message);
  }
}

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "document"; title?: string; source: { type: "base64"; media_type: "application/pdf"; data: string } };

type ClaudeResponse = {
  model?: string;
  stop_reason?: string;
  content?: { type: string; text?: string }[];
  usage?: { input_tokens?: number; output_tokens?: number };
};

export type StructuredResult = {
  data: unknown;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateStructured(opts: {
  system: string;
  content: ContentBlock[];
  schema: Record<string, unknown>;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<StructuredResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AIError("not_configured", "ANTHROPIC_API_KEY is not set");

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
  const effort = process.env.ANTHROPIC_EFFORT || "medium";
  const timeoutMs = opts.timeoutMs ?? 240_000;
  const started = Date.now();

  const body = JSON.stringify({
    model,
    max_tokens: opts.maxTokens ?? 32_000,
    system: opts.system,
    messages: [{ role: "user", content: opts.content }],
    output_config: {
      effort,
      format: { type: "json_schema", schema: opts.schema },
    },
  });

  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": API_VERSION,
        },
        body,
        signal: AbortSignal.timeout(Math.max(1_000, timeoutMs - (Date.now() - started))),
      });
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
        throw new AIError("timeout", "The AI request timed out");
      }
      throw new AIError("upstream", `Network error: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (res.ok) {
      const json = (await res.json()) as ClaudeResponse;
      if (json.stop_reason === "refusal") throw new AIError("refused", "The model declined this request");
      if (json.stop_reason === "max_tokens") throw new AIError("incomplete", "The response hit max_tokens");
      const text = (json.content ?? [])
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("");
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new AIError("bad_output", "The response was not valid JSON");
      }
      return {
        data,
        model: json.model ?? model,
        inputTokens: json.usage?.input_tokens ?? 0,
        outputTokens: json.usage?.output_tokens ?? 0,
      };
    }

    const detail = (await res.text().catch(() => "")).slice(0, 500);
    if (res.status === 401 || res.status === 403) throw new AIError("not_configured", `API key rejected (${res.status})`);
    if (res.status === 413) throw new AIError("too_large", "Request too large");
    if (res.status === 429) throw new AIError("rate_limited", "Rate limited by the AI provider");
    if (res.status === 400) {
      throw new AIError(/too long|too large|page|exceed/i.test(detail) ? "too_large" : "upstream", `Bad request: ${detail}`);
    }
    // 500 / 529 (overloaded) / other 5xx: retry once if there is time left.
    const elapsed = Date.now() - started;
    if (attempt < 2 && res.status >= 500 && elapsed < timeoutMs / 3) {
      await sleep(2_000);
      continue;
    }
    throw new AIError(res.status === 529 ? "overloaded" : "upstream", `AI provider error ${res.status}: ${detail}`);
  }
}
