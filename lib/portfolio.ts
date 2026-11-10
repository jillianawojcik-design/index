// The shape of a generated portfolio, stored as JSON in portfolios.content.
// Shared by the dashboard, the setup script's demo data, and (Step 3) the AI generator.

export type PortfolioContent = {
  headline: string; // e.g. "Mechanical Engineering · Class of 2026"
  intro: string; // 2–4 sentence professional introduction
  skills: string[];
  experience: {
    role: string;
    organization: string;
    dates: string;
    highlights: string[];
  }[];
  projects: {
    title: string;
    summary: string;
    result?: string; // the headline outcome, e.g. "Cut test time 40%"
    tags: string[];
  }[];
};

export const PLAN_LABELS: Record<string, string> = {
  instant: "Instant Portfolio",
  guided: "Guided Portfolio",
  plus: "Folioform Plus",
  pro: "Folioform Pro",
};
