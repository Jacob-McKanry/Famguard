import PageShell, { PageHero } from "@/components/PageShell";
import CopyLink from "@/components/CopyLink";
import PurchaseTracker from "@/components/PurchaseTracker";

export const metadata = { title: "You're in | Family Guardian" };

const STEPS = [
  { t: "Check your inbox.", d: "We sent a confirmation to your email." },
  { t: "Tell us about your family.", d: "A 15-minute call helps us build exactly what you need." },
  { t: "Set up together.", d: "Before launch in 2027, we'll walk you and your parent through setup." },
];

export default async function ConfirmedPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const { paid } = await searchParams;
  // Placeholder until Jacob supplies a real calendar link (CALENDAR_LINK env var).
  const calendar = process.env.CALENDAR_LINK || "[CALENDAR LINK]";
  const calendarReady = calendar.startsWith("http");

  return (
    <PageShell showJoin={false}>
      {paid === "1" && <PurchaseTracker />}
      <PageHero
        eyebrow="Early access"
        title="You're in. Thank you."
        lead="You're one of our first families. Here's what happens next."
      />
      <div className="narrow">
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="card step-card" key={s.t}>
              <div className="flow-num" style={{ flex: "none" }}>{i + 1}</div>
              <div>
                <h2 className="step-title">{s.t}</h2>
                <p className="step-body">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href={calendarReady ? calendar : undefined}
          aria-disabled={calendarReady ? undefined : true}
          className="btn btn-green btn-cta"
        >
          Book a 15-minute call
        </a>
        {!calendarReady && <p className="helper">{calendar}</p>}

        <div className="share-card">
          <p>Know someone caring for a parent? Share Family Guardian with a sibling or friend.</p>
          <CopyLink />
        </div>
      </div>
    </PageShell>
  );
}
