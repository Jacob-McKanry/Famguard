import Stripe from "stripe";

// Returns null when STRIPE_SECRET_KEY is not set.
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// Used by the /reserve page to decide whether to show "[STRIPE NOT CONNECTED YET]".
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
