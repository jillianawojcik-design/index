import type { PortfolioContent } from "@/lib/portfolio";

// Shared pieces of the employer-facing portfolio site (top bar, contact
// footer). Everything is rendered from the saved content; nothing is invented.

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "•"
  );
}

export function ContactLinks({ content, variant }: { content: PortfolioContent; variant: "hero" | "footer" }) {
  const { email, linkedin, github, website } = content.contact;
  const links = [
    email && { href: `mailto:${email}`, label: "Email", external: false },
    linkedin && { href: linkedin, label: "LinkedIn", external: true },
    github && { href: github, label: "GitHub", external: true },
    website && { href: website, label: "Website", external: true },
  ].filter(Boolean) as { href: string; label: string; external: boolean }[];
  if (!links.length) return null;
  return (
    <div className={`site-links site-links--${variant}`}>
      {links.map((l, i) => (
        <a
          key={l.label}
          href={l.href}
          className={i === 0 ? "site-btn site-btn--solid" : "site-btn"}
          {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {l.label}
          {l.external && <span aria-hidden="true"> ↗</span>}
        </a>
      ))}
    </div>
  );
}

export function SiteTop({ content, basePath, onCaseStudy }: { content: PortfolioContent; basePath: string; onCaseStudy?: boolean }) {
  const anchor = (id: string) => (onCaseStudy ? `${basePath}#${id}` : `#${id}`);
  return (
    <header className="site-top">
      <div className="site-wrap site-top-inner">
        <a href={basePath} className="site-mark">
          <span className="site-mono" aria-hidden="true">
            {initials(content.name)}
          </span>
          <span className="site-mark-name">{content.name}</span>
        </a>
        <nav className="site-nav" aria-label="Portfolio sections">
          {content.projects.length > 0 && <a href={anchor("work")}>Work</a>}
          {content.experience.length > 0 && <a href={anchor("experience")}>Experience</a>}
          {content.skills.length > 0 && <a href={anchor("skills")}>Skills</a>}
          <a href={anchor("contact")} className="site-nav-cta">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ content }: { content: PortfolioContent }) {
  return (
    <footer id="contact" className="site-footer">
      <div className="site-wrap">
        <p className="site-kicker site-kicker--light">Contact</p>
        <h2 className="site-footer-title">Let&apos;s talk.</h2>
        {content.targetRole && <p className="site-footer-sub">Seeking: {content.targetRole}</p>}
        <ContactLinks content={content} variant="footer" />
        <div className="site-footer-base">
          <span>
            © {new Date().getFullYear()} {content.name}
          </span>
          <a href="/" className="site-credit">
            Portfolio built with Folioform
          </a>
        </div>
      </div>
    </footer>
  );
}
