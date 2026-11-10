import Link from "next/link";
import type { ReactNode } from "react";

// Shared two-column layout for the login and signup pages: a navy brand
// panel (same style as the homepage's "Why Folioform" band) beside the form.
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link href="/" className="logo">
          Folio<span>form</span>
        </Link>
        <div>
          <h2>
            Your work. Your story. <em>Your future.</em>
          </h2>
          <p>
            Upload the reports, research and projects you&apos;ve already done. Folioform turns them
            into a recruiter-ready portfolio.
          </p>
          <ul className="auth-points">
            <li>Reads your actual project documents</li>
            <li>Never invents credentials or results</li>
            <li>Your uploads stay private by default</li>
          </ul>
        </div>
        <small>Founded by Jillian Wojcik · Penn State Biomedical Engineering</small>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link href="/" className="logo">
            Folio<span>form</span>
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-switch">{footer}</p>
        </div>
      </main>
    </div>
  );
}
