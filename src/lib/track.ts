// Fires analytics events (spec section 11). Safe to call anywhere in the browser:
// if the Meta pixel or Google tag is not loaded (no IDs set), nothing happens.

type Win = Window & {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

export type TrackEvent = "Lead" | "InitiateCheckout" | "Purchase";

// Google uses different names for the same moments.
const GOOGLE_NAMES: Record<TrackEvent, string> = {
  Lead: "generate_lead",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
};

export function track(event: TrackEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  try {
    w.fbq?.("track", event, params);
    w.gtag?.("event", GOOGLE_NAMES[event], params);
  } catch {
    /* analytics must never break the page */
  }
}
