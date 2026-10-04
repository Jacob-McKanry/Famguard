"use client";

// The whole /join experience: Step 1 (choose a plan), the compare table
// (passed in as `compare`), and Step 2 (the form). It is one client component
// because the chosen plan changes the label, the summary card and the submit.

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLANS, getPlan, type PlanId } from "@/data/plans";
import { STATES, WHO_FOR_OPTIONS } from "@/data/states";
import { EMAIL_MESSAGE, isValidEmail, validateSignup, type FieldErrors } from "@/lib/validation";
import { readAttribution } from "@/lib/attribution";
import { track } from "@/lib/track";
import { CheckIcon, ErrorIcon } from "./Icons";

type Props = {
  initialPlan: PlanId;
  compare: React.ReactNode; // the Compare plans table, rendered on the server
  // Only filled in when SHOW_PRICES is true. Otherwise null, and no price is ever sent to the browser.
  prices: Record<PlanId, string> | null;
};

// Watches the screen width so the compare drawer can start open on wide screens.
function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 900px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getWide = () => window.matchMedia("(min-width: 900px)").matches;

// Keep only digits and one dot; at most 4 digits before it and 2 after it.
function cleanAmount(raw: string): string {
  const stripped = raw.replace(/[^\d.]/g, "");
  const [whole, ...rest] = stripped.split(".");
  const decimals = rest.join("").slice(0, 2);
  const w = whole.slice(0, 4);
  return rest.length > 0 ? `${w}.${decimals}` : w;
}

// One error message under a field: red-brown text with a small icon.
function FieldError({ field, message }: { field: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="error-msg" id={`e-${field}`} role="alert">
      <ErrorIcon />
      <span>{message}</span>
    </p>
  );
}

export default function JoinForm({ initialPlan, compare, prices }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [amount, setAmount] = useState("");
  const [notSure, setNotSure] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [whoFor, setWhoFor] = useState("");
  const [state, setState] = useState("");
  const [worry, setWorry] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot, should stay empty
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // The compare drawer is open by default at 900px and wider, closed below.
  // Once the visitor opens or closes it themselves, their choice wins.
  const isWide = useSyncExternalStore(subscribeWide, getWide, () => false);
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const compareOpen = userOpen ?? isWide;

  const formRef = useRef<HTMLFormElement>(null);
  const selected = getPlan(plan)!;

  function setError(field: keyof FieldErrors, message: string | undefined) {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  // The only check that runs when leaving a field (spec section 6.3).
  function onEmailBlur() {
    if (email.trim() === "") return; // an empty box is handled on submit
    setError("email", isValidEmail(email) ? undefined : EMAIL_MESSAGE);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const found = validateSignup({ plan, amount, notSure, firstName, email, whoFor, state, worry, consent }, STATES);
    setErrors(found);
    const firstBad = (["amount", "firstName", "email", "whoFor", "state", "worry", "consent"] as const).find((k) => found[k]);
    if (firstBad) {
      // Move keyboard focus to the first problem field.
      formRef.current?.querySelector<HTMLElement>(`#f-${firstBad}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan, amount, notSure, firstName, email, whoFor, state, worry, consent,
          website,
          attribution: readAttribution(), // src + utm values saved earlier
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setSubmitting(false);
        return;
      }
      if (!res.ok || !data.id) {
        setServerError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      track("Lead", { content_name: selected.name });
      router.push(`/reserve?sid=${encodeURIComponent(data.id)}`);
    } catch {
      setServerError("We could not reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // Helper that builds the props every field shares
  const err = (field: keyof FieldErrors) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `e-${field}` : undefined,
  });
  return (
    <>
      {/* ---------- Step 1: choose your plan ---------- */}
      <section className="join-section" aria-labelledby="step1-title">
        <div className="eyebrow">Step 1</div>
        <h2 className="join-h2" id="step1-title">Choose your plan.</h2>
        <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <legend className="sr-only">Choose your plan</legend>
          <div className="pick-grid">
            {PLANS.map((p) => {
              const isSelected = p.id === plan;
              return (
                <label key={p.id} className={`plan-pick ${isSelected ? "plan-pick-selected" : ""}`}>
                  <input type="radio" name="plan" value={p.id} checked={isSelected} onChange={() => setPlan(p.id)} />
                  <span className="pick-check" aria-hidden="true">{isSelected && <CheckIcon size={16} />}</span>
                  <span className="plan-badge">{p.badge}</span>
                  <span className="plan-name">{p.name}</span>
                  <span className="pick-desc">{p.description}</span>
                  {prices ? (
                    <span className="plan-price">{prices[p.id]}<span className="plan-price-unit"> /month</span></span>
                  ) : (
                    <span className="plan-price-hidden">Pricing shared before launch</span>
                  )}
                  <ul className="pick-features">
                    {p.features.map((f) => (
                      <li key={f}><CheckIcon size={16} /><span>{f}</span></li>
                    ))}
                  </ul>
                  <span className="pick-covers">{p.parentsCovered}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <p className="pick-help">Not sure which? Choose Plus. You can change your plan before launch.</p>

        {/* ---------- Compare drawer ---------- */}
        <details className="compare-details" open={compareOpen} onToggle={(e) => setUserOpen(e.currentTarget.open)}>
          <summary>Compare every feature side by side</summary>
          {compare}
        </details>
      </section>

      {/* ---------- Step 2: the form ---------- */}
      <section className="join-section join-section-last" aria-labelledby="step2-title">
        <div className="eyebrow">Step 2</div>
        <h2 className="join-h2" id="step2-title">A few details.</h2>
        <div className="join-layout">
          <form ref={formRef} onSubmit={onSubmit} noValidate className="card form-card">
            {/* Honeypot: hidden from people, tempting to bots */}
            <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
              <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" /></label>
            </div>

            <div className={`field ${errors.amount ? "has-error" : ""}`}>
              <label htmlFor="f-amount">What would you pay each month for {selected.name}?</label>
              <div className="money">
                <span className="money-affix money-affix-left" aria-hidden="true">$</span>
                <input
                  id="f-amount" className="input" type="text" inputMode="decimal" autoComplete="off"
                  placeholder="For example, 30" value={amount} disabled={notSure}
                  required={!notSure}
                  onChange={(e) => { setAmount(cleanAmount(e.target.value)); setError("amount", undefined); }}
                  {...err("amount")}
                  aria-describedby={`${errors.amount ? "e-amount " : ""}h-amount`}
                />
                <span className="money-affix money-affix-right" aria-hidden="true">/month</span>
              </div>
              <label className="checkbox-row" htmlFor="f-notSure">
                <input
                  id="f-notSure" type="checkbox" checked={notSure}
                  onChange={(e) => { setNotSure(e.target.checked); if (e.target.checked) { setAmount(""); setError("amount", undefined); } }}
                />
                <span>Not sure yet</span>
              </label>
              <p className="helper" id="h-amount">
                There is no wrong answer. We&apos;ll share real pricing before launch, and your answer helps us set it fairly.
              </p>
              <FieldError field="amount" message={errors.amount} />
            </div>

            <div className={`field ${errors.firstName ? "has-error" : ""}`}>
              <label htmlFor="f-firstName">Your first name</label>
              <input id="f-firstName" className="input" type="text" autoComplete="given-name" required
                value={firstName} onChange={(e) => { setFirstName(e.target.value); setError("firstName", undefined); }} {...err("firstName")} />
              <FieldError field="firstName" message={errors.firstName} />
            </div>

            <div className={`field ${errors.email ? "has-error" : ""}`}>
              <label htmlFor="f-email">Email</label>
              <input id="f-email" className="input" type="email" autoComplete="email" required
                value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email && isValidEmail(e.target.value)) setError("email", undefined); }}
                onBlur={onEmailBlur} {...err("email")} />
              <FieldError field="email" message={errors.email} />
            </div>

            <div className={`field ${errors.whoFor ? "has-error" : ""}`}>
              <label htmlFor="f-whoFor">Who are you looking out for?</label>
              <select id="f-whoFor" className="select" required value={whoFor}
                onChange={(e) => { setWhoFor(e.target.value); setError("whoFor", undefined); }} {...err("whoFor")}>
                <option value="">Choose one</option>
                {WHO_FOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <FieldError field="whoFor" message={errors.whoFor} />
            </div>

            <div className={`field ${errors.state ? "has-error" : ""}`}>
              <label htmlFor="f-state">Their state</label>
              <select id="f-state" className="select" required value={state} autoComplete="address-level1"
                onChange={(e) => { setState(e.target.value); setError("state", undefined); }} {...err("state")}>
                <option value="">Choose a state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError field="state" message={errors.state} />
            </div>

            <div className={`field ${errors.worry ? "has-error" : ""}`}>
              <label htmlFor="f-worry">What worries you most right now? <span className="optional">(optional)</span></label>
              <textarea id="f-worry" className="textarea" rows={4} maxLength={2000}
                value={worry} onChange={(e) => setWorry(e.target.value)} {...err("worry")} />
              <FieldError field="worry" message={errors.worry} />
            </div>

            <div className={`field ${errors.consent ? "has-error" : ""}`}>
              <label className="checkbox-row" htmlFor="f-consent">
                <input id="f-consent" type="checkbox" required checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); setError("consent", undefined); }} {...err("consent")} />
                <span>I understand Family Guardian is set up together with my parent, with their agreement.</span>
              </label>
              <FieldError field="consent" message={errors.consent} />
            </div>

            {/* On phones the summary is a one-line bar above the button */}
            <div className="summary-bar">
              <strong>Your plan: {selected.name}.</strong> We&apos;ll share pricing before launch.
            </div>

            <button type="submit" className="btn btn-green form-submit" disabled={submitting}>
              {submitting ? "Saving..." : "Join early access"}
            </button>
            <p className="fine-print">
              No payment needed. By joining you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy policy</Link>.
            </p>
            {serverError && (
              <p className="error-msg form-error-banner" role="alert"><ErrorIcon /><span>{serverError}</span></p>
            )}
          </form>

          {/* Wide screens: sticky summary beside the form */}
          <aside className="join-aside" aria-label="Your plan summary">
            <div className="summary-card">
              <div className="eyebrow eyebrow-gold">Your plan</div>
              <div className="summary-plan">{selected.name}</div>
              <p className="summary-desc">{selected.description}</p>
              <p className="summary-fine">We&apos;ll share pricing before launch. You won&apos;t be charged until launch.</p>
            </div>
            <div className="card promise-card">
              <p><strong>Our promise.</strong> Your parent opts in and sees everything. We never move money and never sell data.</p>
              <Link href="/#respect">Read how it respects your parent</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
