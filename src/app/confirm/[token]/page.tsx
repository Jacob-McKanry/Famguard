import PageShell, { PageHero } from "@/components/PageShell";
import ConfirmActions from "@/components/ConfirmActions";
import { getDb } from "@/lib/supabase";
import { getPlan } from "@/data/plans";
import { PRICE_SETS, type PriceSet } from "@/data/price-sets";

export const metadata = { title: "Confirm your spot | Family Guardian", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Stage-two price test. This is the ONLY page where prices are shown.
export default async function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let signup: { plan: string; price_set: string | null; price_confirmed_at: string | null } | null = null;
  const db = getDb();
  if (db && UUID_RE.test(token)) {
    const { data } = await db.from("signups").select("plan, price_set, price_confirmed_at").eq("confirm_token", token).maybeSingle();
    signup = data;
  }

  const plan = signup ? getPlan(signup.plan) : undefined;
  const set = signup?.price_set as PriceSet | null | undefined;
  const price = plan && set && PRICE_SETS[set] ? PRICE_SETS[set][plan.id] : null;

  return (
    <PageShell showJoin={false}>
      <PageHero
        eyebrow="Early access"
        title="Confirm your spot."
        lead="Here is the plan and planned price we have set aside for you."
      />
      <div className="narrow">
        {plan && price !== null ? (
          <div className="card">
            <p className="big-line"><strong>Your plan: {plan.name}</strong></p>
            <p className="big-line">Planned price: ${price} a month</p>
            <p style={{ color: "#4b5a51", margin: "0 0 24px" }}>No charge until launch in 2027. Cancel anytime.</p>
            <ConfirmActions token={token} alreadyConfirmed={Boolean(signup?.price_confirmed_at)} />
          </div>
        ) : (
          <div className="card"><p className="big-line" style={{ margin: 0 }}>This link isn&apos;t active yet.</p></div>
        )}
      </div>
    </PageShell>
  );
}
