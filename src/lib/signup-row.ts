// Turns a validated form submission into a database row. No framework imports.
import type { SignupInput } from "./validation.ts";

export type AttributionValues = {
  src: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const MAX = 200;
const clip = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, MAX);
  return t || null;
};

export function cleanAttribution(raw: Partial<Record<keyof AttributionValues, unknown>> | null | undefined): AttributionValues {
  return {
    src: clip(raw?.src),
    utm_source: clip(raw?.utm_source),
    utm_medium: clip(raw?.utm_medium),
    utm_campaign: clip(raw?.utm_campaign),
  };
}

export function buildSignupRow(input: SignupInput, attribution: AttributionValues) {
  return {
    first_name: input.firstName.trim(),
    email: input.email.trim().toLowerCase(), // saved lower case so duplicates are caught
    plan: input.plan,
    // Spec: typed amount is null when "Not sure yet" is ticked.
    typed_monthly_amount: input.notSure ? null : Number(input.amount.trim()),
    not_sure: input.notSure,
    who_for: input.whoFor,
    state: input.state,
    worry: input.worry.trim() || null,
    consent: input.consent,
    ...attribution,
  };
}
