// The single source of truth for the three plans.
// The landing page cards, the /join cards and the compare table ALL read from
// this file, so they cannot drift apart. Edit copy here and nowhere else.

export type PlanId = "basic" | "plus" | "premium";

export const PLAN_IDS: PlanId[] = ["basic", "plus", "premium"];

export type Plan = {
  id: PlanId;
  name: string;
  badge: string; // "" means no badge, but the badge slot keeps its height
  // Short line on the landing page card (copied from the reference design).
  landingBlurb: string;
  // One-line description on the /join cards and summary card.
  description: string;
  // Full feature list shown on the /join cards.
  features: string[];
  parentsCovered: string; // e.g. "Covers 1 parent"
};

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    badge: "",
    landingBlurb:
      "Scams caught across calls, texts and email, plus a Sunday update to the family.",
    description: "Automatic scam protection for calls, texts and email.",
    features: [
      "Unknown calls answered and screened first",
      "Texts watched, likely scams held",
      "Email scanned, phishing moved to spam",
      "Family and Mom told right away",
      "Sunday family update",
    ],
    parentsCovered: "Covers 1 parent",
  },
  {
    id: "plus",
    name: "Plus",
    badge: "MOST POPULAR",
    landingBlurb:
      "Everything in Basic, plus help with bills, deadlines and safer web browsing.",
    description: "For families who also want bills, deadlines and devices covered.",
    features: [
      "Everything in Basic",
      "Missed and duplicate bill alerts",
      "Medicare and insurance deadline tracking",
      "Web protection against phishing and viruses",
    ],
    parentsCovered: "Covers 1 parent",
  },
  {
    id: "premium",
    name: "Premium",
    badge: "",
    landingBlurb: "Everything in Plus, with a real person reviewing every alert.",
    description: "For families who want a real person in their corner.",
    features: [
      "Everything in Plus",
      "A person reviews every alert",
      "\"What to do next\" call scripts",
      "Early warning on unusual money patterns",
    ],
    parentsCovered: "Covers up to 2 parents",
  },
];

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// Used when a link has no ?plan= or a bad one. Plus is the default (spec 6.1).
export const DEFAULT_PLAN: PlanId = "plus";

export function planFromParam(value: string | null | undefined): PlanId {
  return getPlan(value)?.id ?? DEFAULT_PLAN;
}

// ---- Compare table ---------------------------------------------------------
// Each row says, for Basic / Plus / Premium: true (yes), false (no) or a text value.
export type CompareValue = boolean | string;
export type CompareRow = { feature: string; values: [CompareValue, CompareValue, CompareValue] };

export const COMPARE_ROWS: CompareRow[] = [
  { feature: "Unknown calls answered and screened first", values: [true, true, true] },
  { feature: "Texts watched, likely scams held", values: [true, true, true] },
  { feature: "Email scanned, phishing moved to spam", values: [true, true, true] },
  { feature: "Family and Mom told right away", values: [true, true, true] },
  { feature: "Sunday family update", values: [true, true, true] },
  { feature: "Missed and duplicate bill alerts", values: [false, true, true] },
  { feature: "Medicare and insurance deadline tracking", values: [false, true, true] },
  { feature: "Web protection against phishing and viruses", values: [false, true, true] },
  { feature: "A person reviews every alert", values: [false, false, true] },
  { feature: "\"What to do next\" call scripts", values: [false, false, true] },
  { feature: "Early warning on unusual money patterns", values: [false, false, true] },
  { feature: "Parents covered", values: ["1", "1", "Up to 2"] },
];
