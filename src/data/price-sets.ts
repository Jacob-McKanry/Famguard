// Stage-two price test. Dollars per month.
// These numbers appear ONLY on /confirm/[token]. Never on public pages while
// SHOW_PRICES is false.
export const PRICE_SETS = {
  A: { basic: 29, plus: 39, premium: 129 },
  B: { basic: 39, plus: 49, premium: 149 },
};

export type PriceSet = keyof typeof PRICE_SETS;
