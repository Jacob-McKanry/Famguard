// Run with:  npm test
// Plain Node test runner, no extra libraries.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSignup, isValidAmount, isValidEmail, EMAIL_MESSAGE, type SignupInput } from "../src/lib/validation.ts";
import { percentile, median, summarizeByPlan } from "../src/lib/stats.ts";
import { toCsv } from "../src/lib/csv.ts";
import { assignPriceSets } from "../src/lib/shuffle-assign.ts";
import { buildSignupRow, cleanAttribution } from "../src/lib/signup-row.ts";
import { STATES } from "../src/data/states.ts";
import { PLANS, COMPARE_ROWS, planFromParam } from "../src/data/plans.ts";

const good: SignupInput = {
  plan: "plus", amount: "30", notSure: false, firstName: "Sam", email: "Sam@Example.com",
  whoFor: "My mom", state: "Ohio", worry: "", consent: true,
};

test("a complete sign-up has no errors", () => {
  assert.deepEqual(validateSignup(good, STATES), {});
});

test("amount accepts 1 to 4 digits, dollars or cents, nothing else", () => {
  for (const ok of ["1", "30", "9999", "29.99", "5.5"]) assert.equal(isValidAmount(ok), true, ok);
  for (const bad of ["", "abc", "12345", "1.234", "-5", "1e3", "$30", "30 "+"x"]) assert.equal(isValidAmount(bad), false, bad);
});

test("amount is required unless 'Not sure yet' is ticked", () => {
  assert.ok(validateSignup({ ...good, amount: "" }, STATES).amount);
  assert.equal(validateSignup({ ...good, amount: "", notSure: true }, STATES).amount, undefined);
});

test("email message matches the spec exactly", () => {
  assert.equal(EMAIL_MESSAGE, "Please enter an email we can reach you at, like name@example.com.");
  assert.equal(validateSignup({ ...good, email: "nope" }, STATES).email, EMAIL_MESSAGE);
  assert.equal(isValidEmail("a@b.co"), true);
});

test("required fields and consent are enforced", () => {
  const e = validateSignup({ ...good, firstName: " ", whoFor: "", state: "", consent: false, plan: "gold" }, STATES);
  for (const k of ["firstName", "whoFor", "state", "consent", "plan"]) assert.ok(e[k as keyof typeof e], k);
});

test("typed amount is null when not sure, email is lower-cased", () => {
  const attr = cleanAttribution({});
  assert.equal(buildSignupRow({ ...good, notSure: true, amount: "50" }, attr).typed_monthly_amount, null);
  const row = buildSignupRow(good, attr);
  assert.equal(row.typed_monthly_amount, 30);
  assert.equal(row.email, "sam@example.com");
  assert.equal(row.worry, null);
});

test("attribution values are trimmed, clipped and nulled when empty", () => {
  const a = cleanAttribution({ src: "  fb-parenting  ", utm_source: "", utm_medium: 5, utm_campaign: "x".repeat(500) });
  assert.equal(a.src, "fb-parenting");
  assert.equal(a.utm_source, null);
  assert.equal(a.utm_medium, null);
  assert.equal(a.utm_campaign?.length, 200);
});

test("percentiles and median", () => {
  assert.equal(median([]), null);
  assert.equal(median([10]), 10);
  assert.equal(median([10, 20, 30]), 20);
  assert.equal(median([10, 20, 30, 40]), 25);
  assert.equal(percentile([10, 20, 30, 40, 50], 25), 20);
  assert.equal(percentile([10, 20, 30, 40, 50], 75), 40);
});

test("per-plan summary ignores 'not sure' and blanks", () => {
  const rows = [
    { plan: "basic", typed_monthly_amount: "10.00", not_sure: false, deposit_status: "paid" },
    { plan: "basic", typed_monthly_amount: 30, not_sure: false, deposit_status: "none" },
    { plan: "basic", typed_monthly_amount: null, not_sure: true, deposit_status: "pending" },
    { plan: "plus", typed_monthly_amount: 50, not_sure: false, deposit_status: "refunded" },
  ];
  const [basic, plus, premium] = summarizeByPlan(rows, ["basic", "plus", "premium"]);
  assert.equal(basic.signups, 3);
  assert.equal(basic.deposits, 1);
  assert.equal(basic.notSure, 1);
  assert.equal(basic.amountsCount, 2);
  assert.equal(basic.median, 20);
  assert.equal(plus.deposits, 0); // refunded does not count as paid
  assert.equal(premium.signups, 0);
  assert.equal(premium.median, null);
});

test("CSV quotes commas, quotes and newlines, and defuses formulas", () => {
  const csv = toCsv([{ key: "a", label: "A" }, { key: "b", label: "B" }], [{ a: 'he said "hi", ok', b: "=HYPERLINK(1)" }, { a: "line\nbreak", b: null }]);
  assert.equal(csv, 'A,B\r\n"he said ""hi"", ok",\'=HYPERLINK(1)\r\n"line\nbreak",\r\n');
});

test("price-set assignment splits evenly into A and B and covers everyone", () => {
  const ids = Array.from({ length: 11 }, (_, i) => `id${i}`);
  const result = assignPriceSets(ids);
  assert.equal(Object.keys(result).length, 11);
  const a = Object.values(result).filter((v) => v === "A").length;
  const b = Object.values(result).filter((v) => v === "B").length;
  assert.equal(a, 6);
  assert.equal(b, 5);
});

test("plan data: three plans, compare rows line up, bad ?plan= falls back to Plus", () => {
  assert.equal(PLANS.length, 3);
  assert.equal(COMPARE_ROWS.length, 12);
  assert.equal(planFromParam("basic"), "basic");
  assert.equal(planFromParam("nope"), "plus");
  assert.equal(planFromParam(undefined), "plus");
  // every compare feature that is a plan feature agrees with the plan cards
  for (const plan of PLANS) {
    const idx = PLANS.indexOf(plan);
    for (const f of plan.features.filter((f) => f !== "Everything in Basic" && f !== "Everything in Plus")) {
      const row = COMPARE_ROWS.find((r) => r.feature === f);
      assert.ok(row, `compare row missing for: ${f}`);
      assert.equal(row.values[idx], true, `${f} should be Yes for ${plan.name}`);
    }
  }
});
