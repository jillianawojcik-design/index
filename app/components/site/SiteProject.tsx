import type { ReactNode } from "react";
import type { PortfolioContent, Project } from "@/lib/portfolio";
import { SiteFooter, SiteTop } from "./SiteChrome";

// A single project case study. Sections without content are left out.
export default function SiteProject({
  content,
  project: p,
  basePath,
}: {
  content: PortfolioContent;
  project: Project;
  basePath: string;
}) {
  const index = content.projects.findIndex((x) => x.slug === p.slug);
  const next = content.projects[(index + 1) % content.projects.length];

  const sections: { id: string; title: string; body: ReactNode }[] = [];
  if (p.challenge) sections.push({ id: "challenge", title: "The challenge", body: <p className="cs-lead">{p.challenge}</p> });
  if (p.objectives.length)
    sections.push({ id: "objectives", title: "Objectives", body: <ul className="cs-list">{p.objectives.map((x) => <li key={x}>{x}</li>)}</ul> });
  if (p.contributions.length)
    sections.push({ id: "role", title: "My contributions", body: <ul className="cs-list">{p.contributions.map((x) => <li key={x}>{x}</li>)}</ul> });
  if (p.approach.length)
    sections.push({
      id: "approach",
      title: "Approach & methodology",
      body: (
        <ol className="cs-steps">
          {p.approach.map((x, i) => (
            <li key={x}>
              <span className="cs-step-num">{String(i + 1).padStart(2, "0")}</span>
              <span>{x}</span>
            </li>
          ))}
        </ol>
      ),
    });
  if (p.tools.length || p.designDecisions.length)
    sections.push({
      id: "design",
      title: "Tools & design decisions",
      body: (
        <>
          {p.tools.length > 0 && (
            <ul className="cs-chips">
              {p.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {p.designDecisions.length > 0 && <ul className="cs-list">{p.designDecisions.map((x) => <li key={x}>{x}</li>)}</ul>}
        </>
      ),
    });
  if (p.validation.length)
    sections.push({ id: "validation", title: "Testing & validation", body: <ul className="cs-list">{p.validation.map((x) => <li key={x}>{x}</li>)}</ul> });
  if (p.impact) sections.push({ id: "impact", title: "Impact", body: <p className="cs-lead">{p.impact}</p> });

  return (
    <div className="site">
      <SiteTop content={content} basePath={basePath} onCaseStudy />

      <header className="cs-hero">
        <div className="site-wrap">
          <a href={`${basePath}#work`} className="cs-back">
            ← All projects
          </a>
          <div className="cs-hero-meta">
            {p.context && <span>{p.context}</span>}
            {p.status && <span className="site-card-status">{p.status}</span>}
          </div>
          <h1 className="cs-title">{p.title}</h1>
          {p.summary && <p className="cs-summary">{p.summary}</p>}
          <dl className="cs-facts">
            {p.role && (
              <div>
                <dt>Role</dt>
                <dd>{p.role}</dd>
              </div>
            )}
            {p.tags.length > 0 && (
              <div>
                <dt>Area</dt>
                <dd>{p.tags.join(" · ")}</dd>
              </div>
            )}
            {p.tools.length > 0 && (
              <div>
                <dt>Tools</dt>
                <dd>{p.tools.slice(0, 5).join(" · ")}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      {p.results.length > 0 && (
        <section className="cs-results" aria-label="Results">
          <div className="site-wrap">
            <p className="site-kicker">Results</p>
            <dl className="cs-results-grid">
              {p.results.map((r) => (
                <div key={r.value + r.label}>
                  {r.value && <dd>{r.value}</dd>}
                  <dt>{r.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {sections.length > 0 && (
        <div className="site-wrap cs-body">
          <nav className="cs-toc" aria-label="Case study sections">
            <p className="site-kicker">In this case study</p>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>
          <article className="cs-article">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="cs-section">
                <h2>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      )}

      {next && next.slug !== p.slug && (
        <a href={`${basePath}/${next.slug}`} className="cs-next">
          <div className="site-wrap">
            <span className="site-kicker site-kicker--light">Next project</span>
            <span className="cs-next-title">{next.title} →</span>
          </div>
        </a>
      )}

      <SiteFooter content={content} />
    </div>
  );
}
