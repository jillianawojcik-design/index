"use client";

import { useState, type MouseEvent } from "react";

type Group = "onetime" | "monthly";

// Placeholder checkout, same behaviour as the original site.
// Step 5 (Stripe) replaces this with a real server-side Checkout session.
function comingSoon(plan: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert(`Checkout for "${plan}" is coming soon. (Connect Stripe here.)`);
  };
}

export default function Pricing() {
  const [group, setGroup] = useState<Group>("onetime");

  const tab = (id: Group, label: string) => (
    <button
      className={group === id ? "active" : undefined}
      role="tab"
      aria-selected={group === id}
      onClick={() => setGroup(id)}
    >
      {label}
    </button>
  );

  return (
    <section id="pricing">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h2>Pay once, or keep it growing</h2>
          <p>Every customer starts with a baseline package. Career add-ons unlock after that.</p>
        </div>

        <div className="toggle" role="tablist" aria-label="Plan type">
          {tab("onetime", "One-time")}
          {tab("monthly", "Monthly")}
        </div>

        {/* One-time plans */}
        <div className="plans plan-group" id="onetime" hidden={group !== "onetime"}>
          <div className="plan">
            <h3>Instant Portfolio</h3>
            <p className="for">For a finished portfolio, fast</p>
            <div className="price">$19<small>one-time</small></div>
            <ul>
              <li>Upload a resume + one project document</li>
              <li>AI-generated professional portfolio</li>
              <li>Automatic skills &amp; accomplishment extraction</li>
              <li>One final generation</li>
              <li>Portfolio analytics</li>
              <li>Downloadable static portfolio</li>
              <li className="no">No editing or regeneration</li>
            </ul>
            <p className="fine">Additional generations require a new purchase.</p>
            <a href="#" className="btn btn-ghost btn-block" onClick={comingSoon("instant")}>Choose Instant</a>
          </div>
          <div className="plan featured">
            <span className="badge">Most flexible</span>
            <h3>Guided Portfolio</h3>
            <p className="for">For input and customization</p>
            <div className="price">$39<small>one-time</small></div>
            <ul>
              <li>Everything in Instant</li>
              <li>Upload up to five projects</li>
              <li>Four customer-directed AI revisions</li>
              <li>Choose from available design styles</li>
              <li>Customize emphasis, wording &amp; organization</li>
              <li>Portfolio analytics</li>
              <li>Downloadable static portfolio</li>
            </ul>
            <p className="fine">Extra revisions available after the four included.</p>
            <a href="#" className="btn btn-primary btn-block" onClick={comingSoon("guided")}>Choose Guided</a>
          </div>
        </div>

        {/* Monthly plans */}
        <div className="plans plan-group" id="monthly" hidden={group !== "monthly"}>
          <div className="plan">
            <h3>Folioform Plus</h3>
            <p className="for">For ongoing portfolio maintenance</p>
            <div className="price">$9<small>/ month</small></div>
            <ul>
              <li>AI portfolio creation &amp; continued access</li>
              <li>Three AI revisions per month</li>
              <li>Ongoing manual editing</li>
              <li>Hosted portfolio website</li>
              <li>Add or update projects</li>
              <li>Shareable professional URL</li>
              <li>Portfolio analytics</li>
            </ul>
            <p className="fine">Job-specific portfolios and interview prep are add-ons.</p>
            <a href="#" className="btn btn-ghost btn-block" onClick={comingSoon("plus")}>Start Plus</a>
          </div>
          <div className="plan featured">
            <span className="badge">For job seekers</span>
            <h3>Folioform Pro</h3>
            <p className="for">For active job seekers &amp; professionals</p>
            <div className="price">$15<small>/ month</small></div>
            <ul>
              <li>Everything in Plus</li>
              <li>Ten AI revisions per month</li>
              <li>Unlimited manual edits</li>
              <li>Additional project uploads</li>
              <li>Expanded portfolio customization</li>
              <li>Continued website hosting</li>
              <li>Portfolio analytics</li>
            </ul>
            <p className="fine">Does not include unlimited job-specific generation or interview prep.</p>
            <a href="#" className="btn btn-primary btn-block" onClick={comingSoon("pro")}>Start Pro</a>
          </div>
        </div>
      </div>
    </section>
  );
}
