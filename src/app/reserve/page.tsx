import Link from "next/link";
import PageShell, { PageHero } from "@/components/PageShell";
import ReserveButton from "@/components/ReserveButton";
import { CheckIcon } from "@/components/Icons";
import { stripeConfigured } from "@/lib/stripe";
import { DEPOSIT_DOLLARS } from "@/config";

export const metadata = { title: "Reserve your spot | Family Guardian" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Optional $10 refundable deposit (spec section 8). Reached as /reserve?sid=<sign-up id>.
export default async function ReservePage({ searchParams }: { searchParams: Promise<{ sid?: string | string[] }> }) {
  const { sid } = await searchParams;
  const id = Array.isArray(sid) ? sid[0] : sid;
  const validSid = id && UUID_RE.test(id) ? id : null;

  return (
    <PageShell showJoin={false}>
      <PageHero
        eyebrow="Step 2 of 2"
        title="You're on the list."
        lead="Want to move to the front of the line? Reserve your spot with a small refundable deposit."
      />
      <div className="narrow">
        <div className="card">
          <h2 className="deposit-title">Refundable deposit, ${DEPOSIT_DOLLARS}.</h2>
          <ul className="check-lines">
            <li><CheckIcon size={18} /><span>Fully refundable anytime, no questions asked</span></li>
            <li><CheckIcon size={18} /><span>Applied to your first month at launch</span></li>
            <li><CheckIcon size={18} /><span>Priority setup with our team</span></li>
          </ul>
          <ReserveButton sid={validSid} stripeReady={stripeConfigured()} />
        </div>
        <Link href="/confirmed" className="plain-link">Skip for now, keep me on the free list.</Link>
      </div>
    </PageShell>
  );
}
