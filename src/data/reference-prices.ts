// Reference prices from the original design ($15, $35, $100).
// Kept in their own file, imported ONLY by server code (the landing page), so the
// numbers can never end up in the JavaScript sent to visitors' browsers while
// SHOW_PRICES is false. Do not import this file from a "use client" component.
import type { PlanId } from "./plans";

export const REFERENCE_PRICES: Record<PlanId, string> = {
  basic: "$15",
  plus: "$35",
  premium: "$100",
};
