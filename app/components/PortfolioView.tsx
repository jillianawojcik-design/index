import type { PortfolioContent } from "@/lib/portfolio";

// Renders a saved portfolio. Reuses the homepage's chip and card styles.
export default function PortfolioView({
  name,
  content,
}: {
  name: string;
  content: PortfolioContent;
}) {
  return (
    <article className="pf">
      <header className="pf-cover">
        <div className="avatar" aria-hidden="true">
          {name
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <h3 className="pf-name">{name}</h3>
          <p className="pf-headline">{content.headline}</p>
        </div>
      </header>

      <div className="pf-body">
        <p className="pf-intro">{content.intro}</p>

        <h4 className="pf-label">Skills</h4>
        <div className="chips">
          {content.skills.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>

        <h4 className="pf-label">Projects</h4>
        <div className="pf-projects">
          {content.projects.map((p) => (
            <div key={p.title} className="pcard">
              <strong>{p.title}</strong>
              {p.result && <p className="pf-result">{p.result}</p>}
              <p className="pf-text">{p.summary}</p>
              <div className="pf-tags">
                {p.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h4 className="pf-label">Experience</h4>
        <ul className="pf-exp">
          {content.experience.map((e) => (
            <li key={e.role + e.organization}>
              <div className="pf-exp-top">
                <strong>{e.role}</strong>
                <span>{e.dates}</span>
              </div>
              <p className="pf-org">{e.organization}</p>
              <ul>
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
