"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Upload + generate. Posts to /api/generate (server) and shows progress while
// Claude writes the portfolio (usually 1–3 minutes).

const MAX_FILE = 4 * 1024 * 1024;
const MAX_TOTAL = 4.3 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const STAGES = [
  { after: 0, text: "Uploading your documents…" },
  { after: 4, text: "Reading your resume and project documents…" },
  { after: 20, text: "Identifying your skills, experience and projects…" },
  { after: 50, text: "Writing project case studies…" },
  { after: 100, text: "Checking every claim against your documents…" },
  { after: 150, text: "Almost done — finishing your portfolio…" },
];

function sizeLabel(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function GenerateForm({
  disabledReason,
  hasPortfolio,
  defaultRole,
}: {
  disabledReason: string | null;
  hasPortfolio: boolean;
  defaultRole: string;
}) {
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [supporting, setSupporting] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function checkFile(f: File): string | null {
    const ext = f.name.toLowerCase().split(".").pop();
    if (ext !== "pdf" && ext !== "docx") return `"${f.name}" isn't a PDF or .docx file.`;
    if (f.size > MAX_FILE) return `"${f.name}" is larger than 4 MB.`;
    return null;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!resume) return setError("Please choose your resume (PDF or .docx).");
    const problems = [resume, ...supporting].map(checkFile).filter(Boolean);
    if (problems.length) return setError(problems[0]!);
    const total = [resume, ...supporting].reduce((n, f) => n + f.size, 0);
    if (total > MAX_TOTAL) return setError(`Your files add up to ${sizeLabel(total)}. The limit is 4 MB in total.`);
    if (String(data.get("targetRole") ?? "").trim().length < 2) return setError("Please enter your target role or industry.");
    if (hasPortfolio && !window.confirm("Generating again will replace your current portfolio content (your public link stays the same). Continue?")) return;

    data.delete("resume");
    data.delete("supporting");
    data.set("resume", resume);
    supporting.forEach((f) => data.append("supporting", f));

    setRunning(true);
    setElapsed(0);
    const started = Date.now();
    timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    try {
      const res = await fetch("/api/generate", { method: "POST", body: data });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setError(
          body?.error ??
            (res.status === 413
              ? "Your files are too large. The limit is 4 MB in total."
              : res.status === 504
                ? "Generation took too long. Please try again with fewer documents."
                : "Something went wrong. Please try again.")
        );
        return;
      }
      router.push("/preview");
      router.refresh();
    } catch {
      setError("Couldn't reach Folioform. Check your connection and try again.");
    } finally {
      if (timer.current) clearInterval(timer.current);
      setRunning(false);
    }
  }

  const stage = [...STAGES].reverse().find((s) => elapsed >= s.after)!;

  // The form stays mounted (just hidden) while generating, so if something
  // fails the user's typed role, notes and chosen files are still there.
  return (
    <>
    {running && (
      <div className="gen-progress" role="status" aria-live="polite">
        <div className="gen-spinner" aria-hidden="true" />
        <p className="gen-stage">{stage.text}</p>
        <p className="gen-elapsed">
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} elapsed · usually 1–3 minutes. Keep this tab open.
        </p>
      </div>
    )}
    <form onSubmit={onSubmit} className="gen-form" noValidate hidden={running}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <span>Resume <em className="req">required</em></span>
        <label className={`drop${resume ? " drop--filled" : ""}`}>
          <input
            type="file"
            name="resume"
            accept={ACCEPT}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setResume(f);
              setError(f ? checkFile(f) : null);
            }}
          />
          {resume ? (
            <span className="drop-file">
              📄 {resume.name} <small>{sizeLabel(resume.size)}</small>
            </span>
          ) : (
            <span className="drop-hint">
              <b>Choose a file</b> — PDF or Word (.docx), up to 4 MB
            </span>
          )}
        </label>
      </div>

      <div className="gen-row">
        <label className="field">
          <span>Target role or industry <em className="req">required</em></span>
          <input name="targetRole" type="text" required maxLength={120} defaultValue={defaultRole} placeholder="e.g. Medical device R&D engineer" />
        </label>
        <label className="field">
          <span>Field <em className="opt">optional</em></span>
          <input name="industry" type="text" maxLength={80} placeholder="e.g. Biomedical engineering" />
        </label>
      </div>

      <details className="gen-more">
        <summary>Add project reports or descriptions (optional, makes case studies much stronger)</summary>
        <div className="field">
          <span>Supporting documents <em className="opt">up to 2 · PDF or .docx</em></span>
          <label className={`drop drop--small${supporting.length ? " drop--filled" : ""}`}>
            <input
              type="file"
              name="supporting"
              accept={ACCEPT}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(0, 2);
                setSupporting(files);
                setError(files.map(checkFile).find(Boolean) ?? null);
              }}
            />
            {supporting.length ? (
              <span className="drop-file">
                {supporting.map((f) => `📎 ${f.name}`).join("   ")}
              </span>
            ) : (
              <span className="drop-hint">Lab reports, design reports, papers, posters</span>
            )}
          </label>
        </div>
        <label className="field">
          <span>Or paste project descriptions / report text <em className="opt">optional</em></span>
          <textarea name="notes" rows={6} maxLength={30000} placeholder="Paste methods, results, your role on a project, links…" />
        </label>
      </details>

      {disabledReason ? (
        <p className="gen-limit">{disabledReason}</p>
      ) : (
        <button type="submit" className="btn btn-primary gen-submit">
          {hasPortfolio ? "Regenerate portfolio" : "Generate portfolio"}
        </button>
      )}
      <p className="gen-privacy">
        Your files are read once to write your portfolio and are not stored. Only the generated text is saved to your account.
      </p>
    </form>
    </>
  );
}
