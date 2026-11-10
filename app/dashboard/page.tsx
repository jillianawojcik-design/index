import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyPlan, getMyPortfolio } from "@/lib/account";
import { PLAN_LABELS } from "@/lib/portfolio";
import AppHeader from "@/app/components/AppHeader";
import PortfolioView from "@/app/components/PortfolioView";

export const metadata: Metadata = { title: "Dashboard — Folioform" };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function DashboardPage() {
  // Protected page: no valid session → back to login.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Both lookups are scoped to the signed-in user inside lib/account.ts.
  const [plan, portfolio] = await Promise.all([getMyPlan(), getMyPortfolio()]);
  const firstName = user.name.split(/\s+/)[0];

  return (
    <>
      <AppHeader user={user} />
      <main className="wrap dash">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome, {firstName}.</h1>
        <p className="dash-lead">
          {portfolio
            ? "Here's your portfolio as it stands. Editing and regenerating are coming next."
            : "Your account is set up. Soon you'll upload your resume and projects here to generate your portfolio."}
        </p>

        <div className="dash-grid">
          <section className="dash-card dash-main" aria-labelledby="pf-heading">
            <div className="dash-card-head">
              <h2 id="pf-heading">Your portfolio</h2>
              {portfolio && (
                <span className="pill">Updated {dateFormat.format(portfolio.updatedAt)}</span>
              )}
            </div>
            {portfolio ? (
              <PortfolioView name={portfolio.title.split(" — ")[0]} content={portfolio.content} />
            ) : (
              <div className="dash-empty">
                <div className="dash-empty-icon" aria-hidden="true">📄</div>
                <h3>No portfolio yet</h3>
                <p>
                  Next up: upload a resume or paste your experience, and Folioform will draft your
                  introduction, skills, experience and project descriptions.
                </p>
                <span className="pill pill-live">Portfolio generator coming soon</span>
              </div>
            )}
          </section>

          <aside className="dash-side">
            <section className="dash-card" aria-labelledby="plan-heading">
              <h2 id="plan-heading">Plan</h2>
              {plan ? (
                <>
                  <p className="dash-plan">{PLAN_LABELS[plan] ?? plan}</p>
                  <p className="dash-note">
                    <span className="status-dot" aria-hidden="true" /> Paid access active
                  </p>
                </>
              ) : (
                <>
                  <p className="dash-plan">Free account</p>
                  <p className="dash-note">Choose a package to generate and save your portfolio.</p>
                  <Link href="/#pricing" className="btn btn-primary btn-sm">
                    See plans
                  </Link>
                </>
              )}
            </section>

            <section className="dash-card" aria-labelledby="acct-heading">
              <h2 id="acct-heading">Account</h2>
              <dl className="dash-meta">
                <div>
                  <dt>Name</dt>
                  <dd>{user.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{dateFormat.format(user.createdAt)}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
