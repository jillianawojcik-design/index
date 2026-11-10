import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyPlan, getMyPortfolio } from "@/lib/account";
import { getUsage } from "@/lib/generation";
import { PLAN_LABELS } from "@/lib/portfolio";
import { publishPortfolio, unpublishPortfolio } from "@/app/actions/portfolio";
import AppHeader from "@/app/components/AppHeader";
import GenerateForm from "./GenerateForm";
import ShareLink from "./ShareLink";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard — Folioform" };

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function DashboardPage() {
  // Protected page: no valid session → back to login.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Every lookup below is scoped to the signed-in user.
  const [plan, portfolio] = await Promise.all([getMyPlan(), getMyPortfolio()]);
  const usage = await getUsage(user.id, plan !== null);
  const firstName = user.name.split(/\s+/)[0];
  const c = portfolio?.content;

  const disabledReason = usage.running
    ? "A portfolio is being generated right now. Refresh this page in a minute."
    : usage.used >= usage.limit
      ? `You've used all ${usage.limit} generations for today. You can edit your portfolio anytime, and generate again within 24 hours.`
      : null;

  return (
    <>
      <AppHeader user={user} />
      <main className="wrap dash">
        <p className="eyebrow">Workspace</p>
        <h1>Welcome, {firstName}.</h1>
        <p className="dash-lead">
          {portfolio
            ? "Your portfolio is saved to your account. Preview it, edit the text, and publish it when you're ready to share."
            : "Upload your resume and tell us the role you're aiming for. Folioform will write your portfolio from your own documents."}
        </p>

        <div className="dash-grid">
          <div className="dash-col">
            {portfolio && c && (
              <section className="dash-card dash-status" aria-labelledby="pf-heading">
                <div className="dash-card-head">
                  <div>
                    <h2 id="pf-heading">{c.name || "Your portfolio"}</h2>
                    <p className="dash-sub">{c.headline}</p>
                  </div>
                  <span className={portfolio.published ? "pill pill-pub" : "pill"}>
                    {portfolio.published ? "● Published" : "Draft"}
                  </span>
                </div>

                <ul className="dash-counts">
                  <li><b>{c.projects.length}</b> case {c.projects.length === 1 ? "study" : "studies"}</li>
                  <li><b>{c.experience.length}</b> experience</li>
                  <li><b>{c.skills.reduce((n, g) => n + g.items.length, 0)}</b> skills</li>
                  <li>Saved {dateFormat.format(portfolio.updatedAt)}</li>
                </ul>

                <div className="dash-actions">
                  <Link href="/preview" className="btn btn-primary btn-sm">Preview portfolio</Link>
                  <Link href="/dashboard/edit" className="btn btn-ghost btn-sm">Edit text</Link>
                  {portfolio.published ? (
                    <form action={unpublishPortfolio}>
                      <button type="submit" className="btn btn-ghost btn-sm">Unpublish</button>
                    </form>
                  ) : (
                    <form action={publishPortfolio}>
                      <button type="submit" className="btn btn-ghost btn-sm">Publish</button>
                    </form>
                  )}
                </div>

                {portfolio.published ? (
                  <div className="dash-share">
                    <p className="dash-label">Your public link — anyone can view it, no account needed</p>
                    <ShareLink slug={portfolio.slug} />
                  </div>
                ) : (
                  <p className="dash-note">Not published yet. Only you can see your preview.</p>
                )}

                {c.suggestions.length > 0 && (
                  <div className="dash-suggest">
                    <p className="dash-label">Suggestions to strengthen it <span>(private)</span></p>
                    <ul>
                      {c.suggestions.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section className="dash-card" aria-labelledby="gen-heading">
              <div className="dash-card-head">
                <h2 id="gen-heading">{portfolio ? "Generate again from new documents" : "Generate your portfolio"}</h2>
                <span className="pill">AI · Claude</span>
              </div>
              <GenerateForm disabledReason={disabledReason} hasPortfolio={!!portfolio} defaultRole={portfolio?.targetRole ?? ""} />
            </section>
          </div>

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
                  <p className="dash-note">Paid packages are coming soon.</p>
                  <Link href="/#pricing" className="btn btn-primary btn-sm">See plans</Link>
                </>
              )}
              <div className="dash-usage">
                <div className="dash-usage-top">
                  <span>AI generations today</span>
                  <b>{Math.min(usage.used, usage.limit)} / {usage.limit}</b>
                </div>
                <div className="meter-track" aria-hidden="true">
                  <div className="meter-fill" style={{ width: `${Math.min(100, (usage.used / Math.max(1, usage.limit)) * 100)}%` }} />
                </div>
              </div>
            </section>

            <section className="dash-card" aria-labelledby="acct-heading">
              <h2 id="acct-heading">Account</h2>
              <dl className="dash-meta">
                <div><dt>Name</dt><dd>{user.name}</dd></div>
                <div><dt>Email</dt><dd>{user.email}</dd></div>
                <div><dt>Member since</dt><dd>{dateFormat.format(user.createdAt)}</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
