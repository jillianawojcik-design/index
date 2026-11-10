import type { PortfolioContent } from "@/lib/portfolio";
import { ContactLinks, SiteFooter, SiteTop } from "./SiteChrome";

// The portfolio's main page. `basePath` is "/preview" for the owner's private
// preview or "/p/<slug>" for the public site; project links hang off it.
export default function SiteHome({ content, basePath }: { content: PortfolioContent; basePath: string }) {
  const c = content;
  const [featured, ...rest] = c.projects;
  const hasCredentials =
    c.education.length + c.certifications.length + c.publications.length + c.accomplishments.length > 0;

  return (
    <div className="site">
      <SiteTop content={c} basePath={basePath} />

      <section className="site-hero">
        <div className={`site-wrap site-hero-grid${c.highlights.length ? "" : " site-hero-grid--solo"}`}>
          <div className="site-hero-main">
            {(c.targetRole || c.location) && (
              <p className="site-kicker site-kicker--light">
                {[c.targetRole, c.location].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="site-name">{c.name}</h1>
            {c.headline && <p className="site-headline">{c.headline}</p>}
            {c.intro && <p className="site-intro">{c.intro}</p>}
            <ContactLinks content={c} variant="hero" />
          </div>
          {c.highlights.length > 0 && (
            <dl className="site-stats">
              {c.highlights.map((h) => (
                <div key={h.value + h.label} className="site-stat">
                  <dt>{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {c.focusAreas.length > 0 && (
          <div className="site-wrap site-focus">
            <span className="site-focus-label">Focus</span>
            <ul>
              {c.focusAreas.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {c.about && (
        <section className="site-section">
          <div className="site-wrap site-split">
            <p className="site-kicker">About</p>
            <p className="site-about">{c.about}</p>
          </div>
        </section>
      )}

      {featured && (
        <section id="work" className="site-section site-section--tint">
          <div className="site-wrap">
            <div className="site-section-head">
              <p className="site-kicker">Selected work</p>
              <h2 className="site-h2">Projects &amp; case studies</h2>
            </div>
            <div className="site-cards">
              {[featured, ...rest].map((p, i) => (
                <a key={p.slug} href={`${basePath}/${p.slug}`} className={`site-card${i === 0 ? " site-card--featured" : ""}`}>
                  <div className="site-card-band" aria-hidden="true">
                    <span className="site-card-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="site-card-body">
                    <div className="site-card-meta">
                      {p.context && <span>{p.context}</span>}
                      {p.status && <span className="site-card-status">{p.status}</span>}
                    </div>
                    <h3>{p.title}</h3>
                    {p.summary && <p className="site-card-summary">{p.summary}</p>}
                    {p.results[0] && (
                      <div className="site-card-result">
                        {p.results[0].value && <strong>{p.results[0].value}</strong>}
                        <span>{p.results[0].label}</span>
                      </div>
                    )}
                    <div className="site-card-foot">
                      <div className="site-tags">
                        {p.tags.slice(0, 4).map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                      <span className="site-card-link">Case study →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.experience.length > 0 && (
        <section id="experience" className="site-section">
          <div className="site-wrap site-split">
            <div>
              <p className="site-kicker">Experience</p>
              <h2 className="site-h2">Where I&apos;ve worked</h2>
            </div>
            <ol className="site-timeline">
              {c.experience.map((e) => (
                <li key={e.role + e.organization + e.dates}>
                  <div className="site-tl-head">
                    <h3>{e.role}</h3>
                    {e.dates && <span>{e.dates}</span>}
                  </div>
                  <p className="site-tl-org">{[e.organization, e.location].filter(Boolean).join(" · ")}</p>
                  {e.summary && <p className="site-tl-summary">{e.summary}</p>}
                  {e.highlights.length > 0 && (
                    <ul>
                      {e.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {c.skills.length > 0 && (
        <section id="skills" className="site-section site-section--tint">
          <div className="site-wrap site-split">
            <div>
              <p className="site-kicker">Skills</p>
              <h2 className="site-h2">Tools &amp; methods</h2>
            </div>
            <div className="site-skills">
              {c.skills.map((g) => (
                <div key={g.category} className="site-skill-group">
                  <h3>{g.category}</h3>
                  <ul>
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasCredentials && (
        <section className="site-section">
          <div className="site-wrap">
            <div className="site-section-head">
              <p className="site-kicker">Credentials</p>
              <h2 className="site-h2">Education &amp; recognition</h2>
            </div>
            <div className="site-creds">
              {c.education.length > 0 && (
                <div>
                  <h3>Education</h3>
                  {c.education.map((e) => (
                    <div key={e.institution + e.degree} className="site-cred">
                      <strong>{e.degree}</strong>
                      <span>{[e.institution, e.dates].filter(Boolean).join(" · ")}</span>
                      {e.details.length > 0 && (
                        <ul>
                          {e.details.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {c.certifications.length > 0 && (
                <div>
                  <h3>Certifications</h3>
                  {c.certifications.map((x) => (
                    <div key={x.name} className="site-cred">
                      <strong>{x.name}</strong>
                      <span>{[x.issuer, x.date].filter(Boolean).join(" · ")}</span>
                    </div>
                  ))}
                </div>
              )}
              {c.publications.length > 0 && (
                <div>
                  <h3>Publications</h3>
                  {c.publications.map((p) => (
                    <div key={p.citation} className="site-cred">
                      <span className="site-cred-cite">{p.citation}</span>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                          Read ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {c.accomplishments.length > 0 && (
                <div>
                  <h3>Recognition &amp; leadership</h3>
                  <ul className="site-cred-list">
                    {c.accomplishments.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <SiteFooter content={c} />
    </div>
  );
}
