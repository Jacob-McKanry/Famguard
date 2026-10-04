// Sign-up validation, shared by the browser form and the server route.
// No framework imports on purpose, so it can be unit tested with plain Node.

export const EMAIL_MESSAGE = "Please enter an email we can reach you at, like name@example.com.";

export type SignupInput = {
  plan: string;
  amount: string; // what the visitor typed, e.g. "30" or "29.99"
  notSure: boolean;
  firstName: string;
  email: string;
  whoFor: string;
  state: string;
  worry: string;
  consent: boolean;
};

export type FieldErrors = Partial<Record<keyof SignupInput, string>>;

// Whole dollars or dollars and cents, 1 to 4 digits before the dot.
const AMOUNT_RE = /^\d{1,4}(\.\d{1,2})?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  const e = email.trim();
  return e.length <= 254 && EMAIL_RE.test(e);
}

export function isValidAmount(amount: string): boolean {
  return AMOUNT_RE.test(amount.trim());
}

// Allowed values. Kept here so client and server agree.
export const PLAN_VALUES = ["basic", "plus", "premium"];
export const WHO_FOR_VALUES = ["My mom", "My dad", "Both parents", "Another relative"];

export function validateSignup(input: SignupInput, validStates: string[]): FieldErrors {
  const errors: FieldErrors = {};
  if (!PLAN_VALUES.includes(input.plan)) errors.plan = "Please choose a plan.";
  if (!input.notSure && !isValidAmount(input.amount)) {
    errors.amount = "Please enter an amount like 30, or tick “Not sure yet”.";
  }
  if (!input.firstName.trim()) errors.firstName = "Please tell us your first name.";
  else if (input.firstName.trim().length > 100) errors.firstName = "That name is too long.";
  if (!isValidEmail(input.email)) errors.email = EMAIL_MESSAGE;
  if (!WHO_FOR_VALUES.includes(input.whoFor)) errors.whoFor = "Please choose who you are looking out for.";
  if (!validStates.includes(input.state)) errors.state = "Please choose a state.";
  if (input.worry.length > 2000) errors.worry = "Please keep this under 2000 characters.";
  if (!input.consent) errors.consent = "Please tick this box to continue.";
  return errors;
}
