import SiteNav from "./components/SiteNav";
import Pricing from "./components/Pricing";

// Homepage — ported from the original static index.html.
// Markup is unchanged apart from JSX syntax (className, style objects).
// The two interactive pieces (mobile menu, pricing toggle) live in
// ./components as small client components.
export default function HomePage() {
  return (
    <>
      <SiteNav />


      <main id="top">

        {/* ===== Hero ===== */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">AI portfolio &amp; career prep</p>
              <h1>Your work. Your story. <em>Your future.</em></h1>
              <p className="lead">
                Upload the resume, lab reports, research papers and projects you&apos;ve already done.
                Folioform reads them, finds your skills and results, and turns them into a polished,
                recruiter-ready portfolio website.
              </p>
              <div className="hero-ctas">
                <a href="#pricing" className="btn btn-primary">Build my portfolio — from $19</a>
                <a href="#how" className="btn btn-ghost">See how it works</a>
              </div>
              <p className="hero-note">For students, recent grads and early-career professionals. Analytics included on every plan.</p>
            </div>

            {/* Real example: the founder&apos;s own portfolio */}
            <div className="hero-visual">

              <a className="mock" href="https://jillianwojcik.netlify.app/" target="_blank" rel="noopener" aria-label="Open Jillian Wojcik&apos;s portfolio" style={{ textDecoration: "none", display: "block" }}>
                <div className="mock-bar"><i></i><i></i><i></i><span className="mock-url">🔒 jillianwojcik.netlify.app</span></div>

                <div className="mock-cover">
                  <svg className="cover-wave" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points="0,40 60,40 75,40 85,10 95,52 105,40 170,40 185,40 195,6 205,54 215,40 280,40 295,40 305,12 315,50 325,40 400,40" />
                  </svg>
                  <div className="cover-row">
                    <div className="avatar">JW</div>
                    <div>
                      <div className="cover-name">Jillian Wojcik</div>
                      <div className="cover-role">Biomedical Engineering · Penn State</div>
                    </div>
                  </div>
                  <p className="cover-tag">Building instrumentation, then proving what it measured is real.</p>
                </div>

                <div className="mock-body">
                  <div className="chips">
                    <span className="chip">MATLAB</span><span className="chip">COMSOL</span>
                    <span className="chip">ESP32 firmware</span><span className="chip">Circuit design</span><span className="chip">Biomaterials</span>
                  </div>

                  <div className="pcard">
                    <div className="pcard-top">
                      <strong>Wearable vocal dosimeter</strong>
                      <span className="pill pill-live">In progress</span>
                    </div>
                    <span className="pcard-sub">Project manager · team of 7 · ESP32 firmware</span>
                    <div className="meter">
                      <div className="meter-label"><span>Phonation-time agreement (bench)</span><b>97.1%</b></div>
                      <div className="meter-track"><div className="meter-fill" style={{ width: "97.1%" }}></div></div>
                    </div>
                  </div>

                  <div className="pcard">
                    <div className="pcard-top">
                      <strong>Coronary stent flow simulation</strong>
                      <span className="pill">COMSOL</span>
                    </div>
                    <span className="pcard-sub">Wall shear stress range by design — lowest wins</span>
                    <div className="bars" aria-label="Wall shear stress range: elliptical 0.2 mm design lowest at 8.48 Pa">
                      <div className="bar"><div style={{ height: "24px" }}></div><span>R 0.2</span></div>
                      <div className="bar"><div style={{ height: "41px" }}></div><span>R 0.4</span></div>
                      <div className="bar win"><div style={{ height: "19px" }}><em>8.48 Pa</em></div><span>E 0.2</span></div>
                      <div className="bar"><div style={{ height: "48px" }}></div><span>E 0.4</span></div>
                    </div>
                  </div>

                  <div className="mock-stat">
                    <div><b>96%</b>ECG classifier accuracy</div>
                    <div><b>&lt;2%</b>EEG circuit error</div>
                    <div><b>$9.60</b>vs. $11 budget</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how" style={{ paddingTop: "40px" }}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">How it works</p>
              <h2>From folder of files to finished portfolio</h2>
              <p>No templates to wrestle with and no code to write. Bring what you already have.</p>
            </div>
            <div className="steps">
              <div className="step"><h3>Upload your work</h3><p>Resumes, reports, research, images and project documents.</p></div>
              <div className="step"><h3>AI analyzes it</h3><p>Identifies your skills, outcomes and achievements.</p></div>
              <div className="step"><h3>Pick a package</h3><p>Instant, Guided, Plus or Pro — one-time or monthly.</p></div>
              <div className="step"><h3>Get your portfolio</h3><p>Share it, download it, and watch engagement.</p></div>
              <div className="step"><h3>Add career tools</h3><p>Tailor for specific jobs and prep for interviews.</p></div>
            </div>
          </div>
        </section>

        {/* ===== Differentiator ===== */}
        <section className="band">
          <div className="wrap band-grid">
            <div>
              <p className="eyebrow">Why Folioform</p>
              <h2>It understands your work — not just how it looks.</h2>
              <p>
                Website builders give you a blank page. Folioform reads your actual project documents and
                turns them into meaningful case studies. It can rephrase and organize your experience,
                but it never invents credentials, results or achievements.
              </p>
            </div>
            <div className="compare">
              <div className="them"><small>Typical website builder</small><p>Pick a theme, write every section yourself, figure out what&apos;s worth highlighting.</p></div>
              <div className="us"><small>Folioform</small><p>Upload a lab report, get a structured case study with your methods, skills and measurable results.</p></div>
            </div>
          </div>
        </section>

        {/* ===== Real example showcase ===== */}
        <section id="example">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">See the standard</p>
              <h2>A real portfolio, built from real coursework</h2>
              <p>
                Folioform&apos;s founder, Jillian Wojcik, turned nine lab reports, simulations and design projects
                into the portfolio Folioform is built to produce: every project leads with its result,
                backs it with data, and is honest about what isn&apos;t finished yet.
              </p>
            </div>

            <div className="transform">
              <div className="t-in">
                <small>What went in</small>
                <h3>BME 429 lab report</h3>
                <ul>
                  <li>Tensile tests on Teflon, rubber &amp; beef tissue</li>
                  <li>500-cycle fatigue runs at 1, 10 &amp; 50 Hz</li>
                  <li>COMSOL stress model</li>
                  <li>Data tables, t-tests, raw plots</li>
                </ul>
              </div>
              <div className="t-arrow" aria-hidden="true">→</div>
              <div className="t-out">
                <small>What came out</small>
                <h3>Mechanical Testing of Teflon, Rubber &amp; Beef Muscle Tissue</h3>
                <p className="headline">Muscle was about <b>28× stiffer</b> cut across the fibers than along them (p = 0.0028).</p>
                <div className="t-stats">
                  <div><b>437.6 MPa</b>Teflon Young&apos;s modulus</div>
                  <div><b>9.86 MPa</b>Teflon yield strength</div>
                  <div><b>n = 27</b>samples tested to failure</div>
                </div>
                <p className="t-note">Plus an honest limitations note: 50 Hz data was flagged as unusable instead of over-reported.</p>
              </div>
            </div>

            <div className="results">
              <div className="result"><b>96%</b><span>accuracy of a MATLAB classifier flagging abnormal heart recordings</span></div>
              <div className="result"><b>3.8× less</b><span>variation in artery wall stress for the stent design the simulation selected</span></div>
              <div className="result"><b>$9.60</b><span>EEG filter circuit, all four bands under 2% error, against an $11 budget</span></div>
              <div className="result"><b>SPIE</b><span>publication from NCI-funded ultrasound &amp; photoacoustic imaging research</span></div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <a href="https://jillianwojcik.netlify.app/" target="_blank" rel="noopener" className="btn btn-ghost">View Jillian&apos;s live portfolio ↗</a>
            </div>
          </div>
        </section>

        {/* ===== Pricing (interactive one-time / monthly toggle) ===== */}
        <Pricing />


        {/* ===== Add-ons ===== */}
        <section id="addons" className="addons-wrap">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Career tools</p>
              <h2>Built for the job search, one application at a time</h2>
              <p>Tailor your portfolio to a specific job description and practice interviews using your real projects.</p>
            </div>
            <div className="addons">
              <div className="addon"><span className="tag">Tailoring</span><h3>Job-Specific Portfolio</h3><div className="amt">$9<small>/job</small></div><p>A version tuned to a pasted job description — highlights what matters, invents nothing.</p></div>
              <div className="addon"><span className="tag">Tailoring</span><h3>Job Tailoring Bundle</h3><div className="amt">$35</div><p>Five job-specific portfolio versions.</p></div>
              <div className="addon"><span className="tag">Interviews</span><h3>Interview Preparation</h3><div className="amt">$12<small>/package</small></div><p>Personalized questions, STAR examples and talking points from your own work.</p></div>
              <div className="addon"><span className="tag">Interviews</span><h3>Interview Prep Bundle</h3><div className="amt">$30</div><p>Three preparation packages.</p></div>
              <div className="addon"><span className="tag">Best value</span><h3>Career Application Bundle</h3><div className="amt">$18<small>/job</small></div><p>One tailored portfolio plus one interview prep package.</p></div>
              <div className="addon"><span className="tag">Revisions</span><h3>Additional AI Revision</h3><div className="amt">$5</div><p>One extra customer-directed revision.</p></div>
              <div className="addon"><span className="tag">Revisions</span><h3>Revision Bundle</h3><div className="amt">$10</div><p>Three additional revisions.</p></div>
              <div className="addon"><span className="tag">Projects</span><h3>Additional Project Analysis</h3><div className="amt">$5<small>/project</small></div><p>Turns another uploaded report into a portfolio case study.</p></div>
            </div>
            <p className="addon-note">Add-ons are available after purchasing any baseline package — one-time or subscription.</p>
          </div>
        </section>

        {/* ===== Included for everyone ===== */}
        <section>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Included on every plan</p>
              <h2>The essentials are never an upsell</h2>
            </div>
            <div className="features">
              <div className="feature"><div className="icon">📈</div><h3>Portfolio analytics</h3><p>Visitor counts, project views and link engagement.</p></div>
              <div className="feature"><div className="icon">🔍</div><h3>AI document analysis</h3><p>Extracts projects, skills, accomplishments and results.</p></div>
              <div className="feature"><div className="icon">📐</div><h3>Professional layouts</h3><p>Clean, recruiter-friendly portfolio structure.</p></div>
              <div className="feature"><div className="icon">🔒</div><h3>Customer control</h3><p>Document review, privacy settings and account access.</p></div>
            </div>
          </div>
        </section>

        {/* ===== Policies / FAQ ===== */}
        <section id="faq" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Policies</p>
              <h2>Straight answers</h2>
            </div>
            <div className="faq">
              <details>
                <summary>Will the AI make up accomplishments?</summary>
                <p>No. Folioform can rephrase and organize your experience, but it never fabricates credentials, results or achievements.</p>
              </details>
              <details>
                <summary>Can I buy an add-on without a package?</summary>
                <p>No — add-ons require an eligible baseline package (Instant, Guided, Plus or Pro).</p>
              </details>
              <details>
                <summary>How are revisions counted?</summary>
                <p>Each submitted revision request uses one credit. Failed generations don&apos;t consume credits.</p>
              </details>
              <details>
                <summary>How long is a one-time portfolio hosted?</summary>
                <p>One-time packages include a 90-day hosted preview with analytics, then continued access through your downloaded static portfolio. Subscribers get hosting for as long as they&apos;re subscribed.</p>
              </details>
              <details>
                <summary>What happens if I cancel my subscription?</summary>
                <p>You keep any files you&apos;ve exported. Ongoing hosting and editing access end according to the subscription terms.</p>
              </details>
              <details>
                <summary>Are my documents private?</summary>
                <p>Yes. Uploaded resumes and reports are private by default, and you can delete your documents and account at any time.</p>
              </details>
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="cta" style={{ paddingTop: "40px" }}>
          <div className="wrap">
            <h2>Turn the work you&apos;ve already done into what comes next.</h2>
            <p>Start with Instant for $19, or go Guided for full control.</p>
            <a href="#pricing" className="btn btn-primary">Build my portfolio</a>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer>
        <div className="wrap foot">
          <div><strong>Folioform</strong> — Your work. Your story. Your future.</div>
          <div>Founded, designed &amp; developed by <a href="https://jillianwojcik.netlify.app/" target="_blank" rel="noopener"><strong>Jillian Wojcik</strong></a> · Biomedical Engineering, Penn State · ENGR 310 · © {new Date().getFullYear()}</div>
        </div>
      </footer>
    </>
  );
}
