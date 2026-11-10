"use client";

import { useActionState, useState, type ReactNode } from "react";
import { saveEdits, type SaveState } from "@/app/actions/portfolio";
import type { Metric, PortfolioContent, Project } from "@/lib/portfolio";

// Edits every text field of the saved portfolio. The whole portfolio is sent
// to the server as JSON and cleaned by normalizeContent() before saving.

const lines = (a: string[]) => a.join("\n");
const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const commas = (a: string[]) => a.join(", ");
const fromCommas = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function Text({ label, value, onChange, hint, wide }: { label: string; value: string; onChange: (v: string) => void; hint?: string; wide?: boolean }) {
  return (
    <label className={`field${wide ? " ed-wide" : ""}`}>
      <span>{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function Area({ label, value, onChange, hint, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number }) {
  return (
    <label className="field ed-wide">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

// Textareas for lists keep raw text while typing; the list is parsed on save.
function Lines({ label, value, onChange, comma, rows = 4 }: { label: string; value: string[]; onChange: (v: string[]) => void; comma?: boolean; rows?: number }) {
  const [raw, setRaw] = useState(comma ? commas(value) : lines(value));
  return (
    <label className="field ed-wide">
      <span>{label}</span>
      {comma ? (
        <input type="text" value={raw} onChange={(e) => { setRaw(e.target.value); onChange(fromCommas(e.target.value)); }} />
      ) : (
        <textarea rows={rows} value={raw} onChange={(e) => { setRaw(e.target.value); onChange(fromLines(e.target.value)); }} />
      )}
      <span className="field-hint">{comma ? "Separate with commas." : "One item per line."}</span>
    </label>
  );
}

function Metrics({ label, value, onChange }: { label: string; value: Metric[]; onChange: (v: Metric[]) => void }) {
  const set = (i: number, m: Partial<Metric>) => onChange(value.map((x, j) => (j === i ? { ...x, ...m } : x)));
  return (
    <div className="field ed-wide">
      <span>{label}</span>
      {value.map((m, i) => (
        <div key={i} className="ed-metric">
          <input type="text" placeholder="Figure, e.g. 96%" value={m.value} onChange={(e) => set(i, { value: e.target.value })} />
          <input type="text" placeholder="What it measures" value={m.label} onChange={(e) => set(i, { label: e.target.value })} />
          <button type="button" className="ed-x" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="ed-add" onClick={() => onChange([...value, { value: "", label: "" }])}>+ Add</button>
      <span className="field-hint">Only include figures you actually measured or documented.</span>
    </div>
  );
}

function Section({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="ed-section" open={open}>
      <summary>{title}</summary>
      <div className="ed-grid">{children}</div>
    </details>
  );
}

export default function Editor({ initial }: { initial: PortfolioContent }) {
  const [c, setC] = useState<PortfolioContent>(initial);
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveEdits, undefined);
  const [dirty, setDirty] = useState(false);

  const update = (patch: Partial<PortfolioContent>) => { setC((prev) => ({ ...prev, ...patch })); setDirty(true); };
  const setProject = (i: number, patch: Partial<Project>) => update({ projects: c.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const setExp = (i: number, patch: Partial<PortfolioContent["experience"][number]>) =>
    update({ experience: c.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  return (
    <form action={(fd) => { setDirty(false); return formAction(fd); }} className="ed">
      <input type="hidden" name="content" value={JSON.stringify(c)} />

      <div className="ed-bar">
        <span className={`ed-status${state && !state.ok ? " ed-status--err" : ""}`} role="status">
          {pending ? "Saving…" : dirty ? "Unsaved changes" : state?.message ?? "All changes saved"}
        </span>
        <div className="ed-bar-actions">
          <a href="/preview" className="btn btn-ghost btn-sm">Preview</a>
          <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>Save changes</button>
        </div>
      </div>

      <Section title="Introduction" open>
        <Text label="Name" value={c.name} onChange={(v) => update({ name: v })} />
        <Text label="Location" value={c.location} onChange={(v) => update({ location: v })} />
        <Text label="Headline" value={c.headline} onChange={(v) => update({ headline: v })} wide />
        <Text label="Target role" value={c.targetRole} onChange={(v) => update({ targetRole: v })} wide />
        <Area label="Intro (hero statement)" value={c.intro} onChange={(v) => update({ intro: v })} rows={3} />
        <Area label="About" value={c.about} onChange={(v) => update({ about: v })} rows={5} />
        <Lines label="Focus areas" value={c.focusAreas} onChange={(v) => update({ focusAreas: v })} comma />
        <Metrics label="Hero highlights" value={c.highlights} onChange={(v) => update({ highlights: v })} />
      </Section>

      <Section title="Contact links">
        <Text label="Email" value={c.contact.email} onChange={(v) => update({ contact: { ...c.contact, email: v } })} hint="Shown publicly. Leave blank to hide." />
        <Text label="LinkedIn URL" value={c.contact.linkedin} onChange={(v) => update({ contact: { ...c.contact, linkedin: v } })} />
        <Text label="GitHub URL" value={c.contact.github} onChange={(v) => update({ contact: { ...c.contact, github: v } })} />
        <Text label="Website URL" value={c.contact.website} onChange={(v) => update({ contact: { ...c.contact, website: v } })} />
      </Section>

      {c.projects.map((p, i) => (
        <Section key={p.slug + i} title={`Project ${i + 1}: ${p.title || "Untitled"}`}>
          <Text label="Title" value={p.title} onChange={(v) => setProject(i, { title: v })} wide />
          <Text label="Context" value={p.context} onChange={(v) => setProject(i, { context: v })} hint="Course, lab or company · year" />
          <Text label="Status" value={p.status} onChange={(v) => setProject(i, { status: v })} hint="e.g. Completed, In progress" />
          <Text label="Your role" value={p.role} onChange={(v) => setProject(i, { role: v })} wide />
          <Area label="Card summary" value={p.summary} onChange={(v) => setProject(i, { summary: v })} rows={2} />
          <Lines label="Tags" value={p.tags} onChange={(v) => setProject(i, { tags: v })} comma />
          <Area label="The challenge" value={p.challenge} onChange={(v) => setProject(i, { challenge: v })} rows={4} />
          <Lines label="Objectives" value={p.objectives} onChange={(v) => setProject(i, { objectives: v })} />
          <Lines label="My contributions" value={p.contributions} onChange={(v) => setProject(i, { contributions: v })} />
          <Lines label="Approach & methodology (in order)" value={p.approach} onChange={(v) => setProject(i, { approach: v })} rows={5} />
          <Lines label="Tools" value={p.tools} onChange={(v) => setProject(i, { tools: v })} comma />
          <Lines label="Design decisions" value={p.designDecisions} onChange={(v) => setProject(i, { designDecisions: v })} />
          <Lines label="Testing & validation" value={p.validation} onChange={(v) => setProject(i, { validation: v })} />
          <Metrics label="Results" value={p.results} onChange={(v) => setProject(i, { results: v })} />
          <Area label="Impact" value={p.impact} onChange={(v) => setProject(i, { impact: v })} rows={3} />
          <div className="ed-wide ed-row-end">
            <button type="button" className="ed-remove" onClick={() => window.confirm(`Remove "${p.title}"?`) && update({ projects: c.projects.filter((_, j) => j !== i) })}>
              Remove this project
            </button>
          </div>
        </Section>
      ))}

      <Section title="Experience">
        {c.experience.map((e, i) => (
          <fieldset key={i} className="ed-wide ed-group">
            <legend>{e.role || "Role"}{e.organization ? ` · ${e.organization}` : ""}</legend>
            <div className="ed-grid">
              <Text label="Role" value={e.role} onChange={(v) => setExp(i, { role: v })} />
              <Text label="Organization" value={e.organization} onChange={(v) => setExp(i, { organization: v })} />
              <Text label="Dates" value={e.dates} onChange={(v) => setExp(i, { dates: v })} />
              <Text label="Location" value={e.location} onChange={(v) => setExp(i, { location: v })} />
              <Lines label="Highlights" value={e.highlights} onChange={(v) => setExp(i, { highlights: v })} />
              <div className="ed-wide ed-row-end">
                <button type="button" className="ed-remove" onClick={() => update({ experience: c.experience.filter((_, j) => j !== i) })}>Remove</button>
              </div>
            </div>
          </fieldset>
        ))}
      </Section>

      <Section title="Skills">
        {c.skills.map((g, i) => (
          <div key={i} className="ed-wide ed-skill">
            <input type="text" aria-label="Category" value={g.category} onChange={(e) => update({ skills: c.skills.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)) })} />
            <Lines label="Skills" value={g.items} onChange={(v) => update({ skills: c.skills.map((x, j) => (j === i ? { ...x, items: v } : x)) })} comma />
          </div>
        ))}
        <button type="button" className="ed-add" onClick={() => update({ skills: [...c.skills, { category: "New category", items: [] }] })}>+ Add category</button>
      </Section>

      <Section title="Recognition & leadership">
        <Lines label="Awards, honors, leadership" value={c.accomplishments} onChange={(v) => update({ accomplishments: v })} />
      </Section>
    </form>
  );
}
