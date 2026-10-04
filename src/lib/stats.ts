// Small statistics helpers for the /admin summary. No framework imports.

// Percentile with linear interpolation. p is 0 to 100. Returns null for no data.
export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export const median = (values: number[]) => percentile(values, 50);

export type SignupLike = {
  plan: string;
  typed_monthly_amount: number | string | null;
  not_sure: boolean;
  deposit_status: string;
};

export type PlanSummary = {
  plan: string;
  signups: number;
  deposits: number; // deposit_status = 'paid'
  notSure: number;
  amountsCount: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
};

export function summarizeByPlan(rows: SignupLike[], plans: string[]): PlanSummary[] {
  return plans.map((plan) => {
    const mine = rows.filter((r) => r.plan === plan);
    const amounts = mine
      .filter((r) => !r.not_sure && r.typed_monthly_amount !== null && r.typed_monthly_amount !== "")
      .map((r) => Number(r.typed_monthly_amount))
      .filter((n) => Number.isFinite(n));
    return {
      plan,
      signups: mine.length,
      deposits: mine.filter((r) => r.deposit_status === "paid").length,
      notSure: mine.filter((r) => r.not_sure).length,
      amountsCount: amounts.length,
      median: median(amounts),
      p25: percentile(amounts, 25),
      p75: percentile(amounts, 75),
    };
  });
}
