// Portfolio content: the shape stored as JSON in portfolios.content.
// Written by the AI generator, the editor, and the demo seed. Everything that
// writes it goes through normalizeContent(), which enforces types and length
// limits and only lets safe http(s)/mailto links through.

export type Metric = { value: string; label: string };

export type Project = {
  slug: string;
  title: string;
  context: string; // e.g. "Senior design · Penn State · 2026"
  status: string; // e.g. "Completed", "In progress"; "" if unknown
  role: string; // the user's role on the project
  summary: string; // 1–2 sentence card summary
  tags: string[];
  challenge: string;
  objectives: string[];
  contributions: string[];
  approach: string[]; // methodology, in order
  tools: string[];
  designDecisions: string[];
  validation: string[];
  results: Metric[]; // only documented outcomes
  impact: string;
};

export type PortfolioContent = {
  version: 2;
  name: string;
  headline: string;
  targetRole: string;
  location: string;
  intro: string;
  about: string;
  contact: { email: string; linkedin: string; github: string; website: string };
  highlights: Metric[];
  focusAreas: string[];
  skills: { category: string; items: string[] }[];
  experience: {
    role: string;
    organization: string;
    location: string;
    dates: string;
    summary: string;
    highlights: string[];
  }[];
  projects: Project[];
  education: { institution: string; degree: string; dates: string; details: string[] }[];
  certifications: { name: string; issuer: string; date: string }[];
  publications: { citation: string; url: string }[];
  accomplishments: string[];
  // Private notes for the owner ("add the accuracy you measured…"). Never shown publicly.
  suggestions: string[];
};

export const PLAN_LABELS: Record<string, string> = {
  instant: "Instant Portfolio",
  guided: "Guided Portfolio",
  plus: "Folioform Plus",
  pro: "Folioform Pro",
};

// ---------------------------------------------------------------------------
// Normalization

const SHORT = 200;
const MEDIUM = 600;
const LONG = 2500;

function str(v: unknown, max = SHORT): string {
  if (typeof v !== "string") return "";
  return v.replace(/\s+\n/g, "\n").trim().slice(0, max);
}

function strList(v: unknown, maxItems: number, maxLen = MEDIUM): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => str(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function objList<T>(v: unknown, maxItems: number, map: (o: Record<string, unknown>) => T, keep: (t: T) => boolean): T[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x))
    .map(map)
    .filter(keep)
    .slice(0, maxItems);
}

function metrics(v: unknown, maxItems: number): Metric[] {
  return objList(v, maxItems, (o) => ({ value: str(o.value, 40), label: str(o.label, SHORT) }), (m) => !!(m.value && m.label));
}

// Accepts only http(s) URLs (adding https:// to bare domains like
// "linkedin.com/in/x"). Anything else — javascript:, data:, etc. — becomes "".
export function safeUrl(v: unknown): string {
  const raw = str(v, 300);
  if (!raw) return "";
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    if (!url.hostname.includes(".")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function safeEmail(v: unknown): string {
  const raw = str(v, 254).replace(/^mailto:/i, "");
  return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(raw) ? raw : "";
}

export function slugify(text: string, fallback = "item"): string {
  const s = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return s || fallback;
}

export function normalizeContent(input: unknown): PortfolioContent {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const contact = (o.contact && typeof o.contact === "object" ? o.contact : {}) as Record<string, unknown>;

  // Legacy (Step 2) skills were a flat string list.
  const rawSkills = Array.isArray(o.skills) && o.skills.every((s) => typeof s === "string")
    ? [{ category: "Skills", items: o.skills }]
    : o.skills;

  const usedSlugs = new Set<string>();
  const projects = objList(
    o.projects,
    8,
    (p): Project => {
      const title = str(p.title, 140);
      let slug = slugify(title, "project");
      for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(title, "project")}-${n}`;
      usedSlugs.add(slug);
      // Legacy projects had a single "result" string.
      const legacyResult = typeof p.result === "string" && p.result.trim()
        ? [{ value: "", label: p.result }]
        : [];
      return {
        slug,
        title,
        context: str(p.context, SHORT),
        status: str(p.status, 40),
        role: str(p.role, SHORT),
        summary: str(p.summary, MEDIUM),
        tags: strList(p.tags, 8, 40),
        challenge: str(p.challenge, LONG),
        objectives: strList(p.objectives, 8),
        contributions: strList(p.contributions, 10),
        approach: strList(p.approach, 10),
        tools: strList(p.tools, 16, 60),
        designDecisions: strList(p.designDecisions, 8),
        validation: strList(p.validation, 8),
        results: [...metrics(p.results, 6), ...legacyResult.filter((r) => r.label)].slice(0, 6) as Metric[],
        impact: str(p.impact, LONG),
      };
    },
    (p) => !!p.title
  );

  return {
    version: 2,
    name: str(o.name, 100),
    headline: str(o.headline, SHORT),
    targetRole: str(o.targetRole, 120),
    location: str(o.location, 100),
    intro: str(o.intro, MEDIUM),
    about: str(o.about, LONG),
    contact: {
      email: safeEmail(contact.email),
      linkedin: safeUrl(contact.linkedin),
      github: safeUrl(contact.github),
      website: safeUrl(contact.website),
    },
    highlights: metrics(o.highlights, 4),
    focusAreas: strList(o.focusAreas, 5, 60),
    skills: objList(
      rawSkills,
      8,
      (s) => ({ category: str(s.category, 60), items: strList(s.items, 16, 60) }),
      (s) => s.items.length > 0
    ).map((s) => ({ ...s, category: s.category || "Skills" })),
    experience: objList(
      o.experience,
      10,
      (e) => ({
        role: str(e.role, 120),
        organization: str(e.organization, 120),
        location: str(e.location, 100),
        dates: str(e.dates, 60),
        summary: str(e.summary, MEDIUM),
        highlights: strList(e.highlights, 8),
      }),
      (e) => !!(e.role || e.organization)
    ),
    projects,
    education: objList(
      o.education,
      5,
      (e) => ({
        institution: str(e.institution, 140),
        degree: str(e.degree, 160),
        dates: str(e.dates, 60),
        details: strList(e.details, 6),
      }),
      (e) => !!(e.institution || e.degree)
    ),
    certifications: objList(
      o.certifications,
      10,
      (c) => ({ name: str(c.name, 160), issuer: str(c.issuer, 120), date: str(c.date, 40) }),
      (c) => !!c.name
    ),
    publications: objList(
      o.publications,
      10,
      (p) => ({ citation: str(p.citation, MEDIUM), url: safeUrl(p.url) }),
      (p) => !!p.citation
    ),
    accomplishments: strList(o.accomplishments, 10),
    suggestions: strList(o.suggestions, 10),
  };
}

// True when generation produced something worth showing.
export function hasSubstance(c: PortfolioContent): boolean {
  return !!c.name && (c.projects.length > 0 || c.experience.length > 0 || c.education.length > 0);
}
