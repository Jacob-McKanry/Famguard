import Link from "next/link";
import PageShell from "@/components/PageShell";
import CompareTable from "@/components/CompareTable";
import { SHOW_PRICES } from "@/config";
import { DOORS, FACTS, FLOW, SCAMS, WHO } from "@/data/landing";
import { PLANS } from "@/data/plans";
import { REFERENCE_PRICES } from "@/data/reference-prices";

// The landing page. Every section follows the reference design in order.
// Differences from the reference are only the ones listed in spec section 5.
export default function LandingPage() {
  return (
    <PageShell onHome>
      {/* ---- Hero ---- */}
      <section className="on-dark">
        <div className="hero-inner">
          <div>
            <div className="eyebrow eyebrow-gold">Scam protection for your aging parent</div>
            <h1 className="hero-title">Scammers target your parents. We help stop them.</h1>
            <p className="hero-lead">
              A guardian that works automatically for your parent, paid for by the family. Mom forwards nothing and remembers nothing.
            </p>
            <div className="hero-cta-row">
              <Link href="/join" className="btn btn-light btn-hero">Join early access, free</Link>
              <span className="hero-note">
                {SHOW_PRICES ? "From $15/month. Launching 2027." : "Free to join. Launching 2027."}
              </span>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-number">$7.7B</div>
              <div className="stat-label">
                lost to fraud by Americans 60+ in 2025 <span className="stat-source">FBI IC3</span>
              </div>
            </div>
            <div className="stat">
              <div className="stat-number">63M</div>
              <div className="stat-label">
                Americans care for a family member <span className="stat-source">AARP, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- What it does ---- */}
      <section id="doors" className="doors">
        <div className="eyebrow">What it does</div>
        <h2 className="doors-title">We watch every door a scammer uses.</h2>
        <p className="doors-lead">
          Calls, texts and email are covered automatically. Mom never has to read, judge or forward anything.
        </p>
        <div className="grid-auto-300">
          {DOORS.map((d) => (
            <div className="card" key={d.k}>
              <div className="door-kicker">{d.k}</div>
              <div className="door-title">{d.t}</div>
              <div className="door-list">{d.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Four steps ---- */}
      <section className="band-pale section-pad">
        <div className="wrap">
          <div className="eyebrow">When something looks risky</div>
          <h2 className="flow-title">Four steps, usually before Mom even knows.</h2>
          <div className="flow-grid">
            {FLOW.map((s) => (
              <div className="flow-card" key={s.n}>
                <div className="flow-num">{s.n}</div>
                <div className="flow-name">{s.t}</div>
                <div className="flow-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Examples we catch ---- */}
      <section className="scams">
        <div className="eyebrow">Examples we catch</div>
        <h2 className="h2">The scams we hear about most.</h2>
        <div className="scam-grid">
          {SCAMS.map((s) => (
            <div className="scam-card" key={s.k}>
              <div className="scam-kind">{s.k}</div>
              <div className="scam-quote">“{s.q}”</div>
              <div className="scam-desc">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Respectful of Mom ---- */}
      <section id="respect" className="band-dark respect">
        <div className="respect-grid">
          <div>
            <div className="eyebrow eyebrow-gold">Respectful of Mom</div>
            <h2 className="respect-title">It protects her. It doesn&apos;t take over.</h2>
            <div className="respect-checks">
              <div>✓ She opts in. It&apos;s set up together.</div>
              <div>✓ She sees what the family sees.</div>
              <div>✓ She can turn it off anytime.</div>
              <div>✓ We never move her money or sell her data.</div>
            </div>
          </div>
          <div>
            <div className="eyebrow eyebrow-gold">Who it&apos;s for</div>
            <div className="who-list">
              {WHO.map((w) => (
                <div className="who-item" key={w.t}>
                  <b>{w.t}</b>
                  <div className="who-desc">{w.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Plans (+ compare table) ---- */}
      <section id="plans" className="plans">
        <div className="eyebrow">Three monthly plans</div>
        <h2 className="h2">Paid for by the family. Pick what fits.</h2>
        <div className="plan-grid">
          {PLANS.map((plan) => {
            const selected = plan.id === "plus";
            return (
              <div className={`plan-card ${selected ? "plan-card-selected" : "plan-card-other"}`} key={plan.id}>
                <div className="plan-badge">{plan.badge}</div>
                <div className="plan-name">{plan.name}</div>
                {SHOW_PRICES ? (
                  <div className="plan-price">
                    {REFERENCE_PRICES[plan.id]}<span className="plan-price-unit"> /month</span>
                  </div>
                ) : (
                  <div className="plan-price-hidden">Pricing shared before launch</div>
                )}
                <div className="plan-blurb">{plan.landingBlurb}</div>
                <Link
                  href={`/join?plan=${plan.id}`}
                  className={`btn btn-plan ${selected ? "btn-plan-selected" : "btn-plan-other"}`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="compare-head">
          <div className="eyebrow">Compare plans</div>
          <h2 className="h2">Every feature, side by side.</h2>
        </div>
        <CompareTable />
      </section>

      {/* ---- Where we are ---- */}
      <section id="status" className="status">
        <div className="status-grid">
          <div>
            <div className="eyebrow">Where we are</div>
            <h2 className="status-title">Not built yet. Early access opens to a small group of families first.</h2>
            <p className="status-lead">We&apos;re learning which plan families choose, and we&apos;d rather build it with you.</p>
          </div>
          <div className="facts">
            {FACTS.map((f) => (
              <div className="fact-row" key={f.k}>
                <span className="fact-key">{f.k}</span>
                <b className="fact-val">{f.v}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final call to action ---- */}
      <section className="final-cta">
        <h2 className="final-title">Don&apos;t wait for the scam to find them first</h2>
        <p className="final-lead">Joining is free. An optional $10 deposit is fully refundable.</p>
        <Link href="/join" className="btn btn-green btn-cta">Join early access</Link>
      </section>
    </PageShell>
  );
}
