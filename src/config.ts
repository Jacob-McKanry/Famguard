// Site-wide settings. Small file, easy to change.

// Stage one of the test hides all prices. Flip to true to show the reference
// prices ($15, $35, $100) on the public pages. Keep it false until Jacob says so.
export const SHOW_PRICES = false;

// Visible placeholders. Replace these when you have the real values.
export const COMPANY_NAME = "[COMPANY NAME]";
export const CONTACT_EMAIL = "[CONTACT EMAIL]";

// The public address of the site. Falls back to a visible placeholder.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "[YOUR SITE URL]";

// Deposit amount in dollars (Stripe wants cents, so the checkout code multiplies by 100).
export const DEPOSIT_DOLLARS = 10;
