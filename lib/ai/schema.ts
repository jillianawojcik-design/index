// JSON Schema for Claude's structured output (output_config.format).
// The API guarantees the response matches this schema. Per Anthropic's
// structured-output rules, every object sets additionalProperties: false and
// no length/count constraints are used — limits are enforced afterwards by
// normalizeContent(). Empty strings / empty arrays mean "not in the documents".

type Schema = Record<string, unknown>;

const s = (description: string): Schema => ({ type: "string", description });
const list = (description: string, items: Schema = { type: "string" }): Schema => ({
  type: "array",
  description,
  items,
});
const obj = (properties: Record<string, Schema>, description?: string): Schema => ({
  type: "object",
  ...(description ? { description } : {}),
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const metric = obj({
  value: s('Short figure exactly as documented, e.g. "96%", "< 2%", "$9.60", "n = 27". No invented numbers.'),
  label: s("What the figure measures, in plain words."),
});

export const PORTFOLIO_SCHEMA: Schema = obj({
  name: s("The person's full name as written in the documents."),
  headline: s('Professional identity line, e.g. "Biomedical Engineer — Wearable Sensing & Signal Processing".'),
  targetRole: s("The target role/industry, cleaned up."),
  location: s('City/region only if stated in the documents, else "".'),
  intro: s("Hero statement, 1–2 sentences, first person, specific to their work."),
  about: s("One paragraph (3–5 sentences) connecting their background to the target role. First person."),
  contact: obj({
    email: s('Email if present in the documents, else "".'),
    linkedin: s('LinkedIn URL if present, else "".'),
    github: s('GitHub URL if present, else "".'),
    website: s('Personal website/portfolio URL if present, else "".'),
  }),
  highlights: list("Up to 4 standout documented outcomes for the hero. Empty if none are documented.", metric),
  focusAreas: list("3–5 short areas of expertise (2–4 words each) supported by the documents."),
  skills: list(
    "Skills grouped into 2–6 categories relevant to the field. Only skills evidenced in the documents.",
    obj({ category: s("Category name"), items: list("Skills in this category") })
  ),
  experience: list(
    "Work, research, leadership and clinical experience, most recent first.",
    obj({
      role: s("Title"),
      organization: s("Organization"),
      location: s('Location if stated, else ""'),
      dates: s('Dates as written, e.g. "May 2025 – Dec 2025"'),
      summary: s('One sentence on the scope of the role, or "".'),
      highlights: list("2–4 specific accomplishments from the documents."),
    })
  ),
  projects: list(
    "Projects as case studies, strongest and most relevant to the target role first. Depth should match how much the documents say.",
    obj({
      title: s("Clear, specific project title."),
      context: s('Course, lab, company or competition and year, e.g. "BME 429 · Penn State · 2026". "" if unknown.'),
      status: s('"Completed", "In progress", or "" if unclear.'),
      role: s('The person\'s role, e.g. "Project manager & firmware lead", "Individual project". "" if unknown.'),
      summary: s("1–2 sentence summary for the project card, leading with what was built and the documented result."),
      tags: list("2–5 short domain/technology tags."),
      challenge: s("The engineering, research or business problem and why it matters. \"\" if not documented."),
      objectives: list("What the project set out to achieve (targets, requirements)."),
      contributions: list("What THIS person personally did. Do not credit them with team work they didn't claim."),
      approach: list("Technical approach / methodology, in order."),
      tools: list("Tools, instruments, software, languages and methods actually used."),
      designDecisions: list("Key design decisions and the reason for each, if documented."),
      validation: list("How it was tested or validated (protocols, comparisons, statistics)."),
      results: list("Documented, quantified results only. Mark preliminary results as preliminary in the label.", metric),
      impact: s('Practical significance or what the work enables, grounded in the documents. "" if not supported.'),
    })
  ),
  education: list(
    "Degrees and programs.",
    obj({
      institution: s("School"),
      degree: s("Degree and major"),
      dates: s('Dates or expected graduation as written, else ""'),
      details: list("Relevant honors, GPA (only if stated), minors, coursework."),
    })
  ),
  certifications: list(
    "Certifications and licenses listed in the documents.",
    obj({ name: s("Certification"), issuer: s('Issuer or ""'), date: s('Date or ""') })
  ),
  publications: list(
    "Publications, posters, presentations listed in the documents.",
    obj({ citation: s("Citation as written"), url: s('URL or DOI link if given, else ""') })
  ),
  accomplishments: list("Awards, honors, scholarships, leadership roles not covered elsewhere."),
  suggestions: list(
    "3–8 specific, private suggestions for what the person could add to strengthen the portfolio (missing metrics, unclear roles, missing links). Not shown publicly."
  ),
});
