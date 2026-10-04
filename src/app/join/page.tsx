import PageShell, { PageHero } from "@/components/PageShell";
import JoinForm from "@/components/JoinForm";
import CompareTable from "@/components/CompareTable";
import { SHOW_PRICES } from "@/config";
import { planFromParam } from "@/data/plans";
import { REFERENCE_PRICES } from "@/data/reference-prices";

export const metadata = { title: "Join early access | Family Guardian" };

// /join?plan=basic|plus|premium preselects a plan. Anything else means Plus.
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan } = await searchParams;
  const initialPlan = planFromParam(Array.isArray(plan) ? plan[0] : plan);
  return (
    <PageShell showJoin={false}>
      <PageHero
        eyebrow="Early access"
        title="Join early access."
        lead="Free to join. We'll reach out before launch to set things up with you and your parent."
      />
      <JoinForm
        initialPlan={initialPlan}
        compare={<CompareTable />}
        prices={SHOW_PRICES ? REFERENCE_PRICES : null}
      />
    </PageShell>
  );
}
