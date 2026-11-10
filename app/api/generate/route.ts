import { getCurrentUser } from "@/lib/session";
import { getMyPlan } from "@/lib/account";
import {
  DocumentError,
  MAX_SUPPORTING_FILES,
  MAX_TOTAL_BYTES,
  parseUpload,
  type ParsedDocument,
} from "@/lib/documents";
import { AIError, generateStructured, type ContentBlock } from "@/lib/ai/claude";
import { PORTFOLIO_SCHEMA } from "@/lib/ai/schema";
import { SYSTEM_PROMPT, buildUserInstructions } from "@/lib/ai/prompt";
import { hasSubstance, normalizeContent } from "@/lib/portfolio";
import { finishGeneration, savePortfolio, startGeneration } from "@/lib/generation";

// POST /api/generate — resume (+ optional supporting docs/text) → AI portfolio.
// Runs on the server only. Uploaded files are read in memory and discarded.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // seconds; generation typically takes 1–3 minutes

const MAX_NOTES = 30_000;

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

const AI_MESSAGES: Record<string, [number, string]> = {
  not_configured: [503, "The AI service isn't configured yet. (The site owner needs to set ANTHROPIC_API_KEY.)"],
  rate_limited: [503, "The AI service is busy right now. Please wait a minute and try again."],
  overloaded: [503, "The AI service is busy right now. Please wait a minute and try again."],
  timeout: [504, "Generation took too long. Try again, or upload fewer or shorter documents."],
  too_large: [413, "Those documents are too long to process together. Try fewer or shorter files."],
  refused: [422, "The AI couldn't process these documents. Please check they're your resume and project files."],
  incomplete: [502, "The AI response was cut off. Try again with fewer supporting documents."],
  bad_output: [502, "The AI returned an unreadable response. Please try again."],
  upstream: [502, "Something went wrong reaching the AI service. Please try again."],
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Please log in again.");

  // ---- Read and validate the form -------------------------------------
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_TOTAL_BYTES + 200_000) return fail(413, "Your files are over the 4 MB total limit.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Couldn't read the upload. Please try again.");
  }

  const targetRole = String(form.get("targetRole") ?? "").trim().slice(0, 120);
  const industry = String(form.get("industry") ?? "").trim().slice(0, 80);
  const notes = String(form.get("notes") ?? "").trim();
  const resume = form.get("resume");
  const supporting = form.getAll("supporting").filter((f): f is File => f instanceof File && f.size > 0);

  if (targetRole.length < 2) return fail(400, "Please enter the role or industry you're targeting.");
  if (!(resume instanceof File) || resume.size === 0) return fail(400, "Please upload your resume (PDF or .docx).");
  if (supporting.length > MAX_SUPPORTING_FILES) return fail(400, `You can add up to ${MAX_SUPPORTING_FILES} supporting documents.`);
  if (notes.length > MAX_NOTES) return fail(400, `Pasted text is limited to ${MAX_NOTES.toLocaleString()} characters.`);
  const totalBytes = resume.size + supporting.reduce((n, f) => n + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) return fail(413, "Your files are over the 4 MB total limit.");

  let docs: ParsedDocument[];
  try {
    docs = [await parseUpload(resume), ...(await Promise.all(supporting.map(parseUpload)))];
  } catch (err) {
    if (err instanceof DocumentError) return fail(400, err.message);
    throw err;
  }

  // ---- Limits (API cost control) ---------------------------------------
  const paid = (await getMyPlan()) !== null;
  const start = await startGeneration(user.id, paid);
  if (!start.ok) {
    const messages = {
      running: "A portfolio is already being generated. Please wait for it to finish.",
      user_limit: "You've reached today's generation limit. You can generate again within 24 hours.",
      too_many_failures: "Too many failed attempts today. Please try again tomorrow.",
      global_limit: "Folioform has reached today's generation capacity. Please try again tomorrow.",
    } as const;
    return fail(429, messages[start.reason]);
  }

  // ---- Call Claude -------------------------------------------------------
  const content: ContentBlock[] = [];
  docs.forEach((d, i) => {
    const label = i === 0 ? `Resume: ${d.name}` : `Supporting document: ${d.name}`;
    if (d.kind === "pdf") {
      content.push({ type: "document", title: label, source: { type: "base64", media_type: "application/pdf", data: d.base64 } });
    } else {
      content.push({ type: "text", text: `<document title="${label.replace(/"/g, "'")}">\n${d.text}\n</document>` });
    }
  });
  content.push({
    type: "text",
    text: buildUserInstructions({ targetRole, industry, notes, documentNames: docs.map((d) => d.name) }),
  });

  try {
    const result = await generateStructured({ system: SYSTEM_PROMPT, content, schema: PORTFOLIO_SCHEMA });
    const portfolio = normalizeContent({ ...(result.data as object), targetRole });
    if (!hasSubstance(portfolio)) {
      await finishGeneration(start.requestId, { ok: false, errorCode: "empty", model: result.model });
      return fail(422, "We couldn't find enough in that resume to build a portfolio. Check it's the right file, or add project details.");
    }
    const saved = await savePortfolio(user.id, portfolio);
    await finishGeneration(start.requestId, { ok: true, model: result.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens });
    return Response.json({ ok: true, slug: saved.slug }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const code = err instanceof AIError ? err.code : "internal";
    console.error(`Generation failed (${code}):`, err instanceof Error ? err.message : err);
    await finishGeneration(start.requestId, { ok: false, errorCode: code }).catch(() => {});
    const [status, message] = AI_MESSAGES[code] ?? [500, "Something went wrong while generating. Please try again."];
    return fail(status, message);
  }
}
