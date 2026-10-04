# Family Guardian: Live Documentation

This file is the running record of the build. It is updated in the same commit as every feature, plan change, decision or environment variable change. If this file and the code ever disagree, tell Claude and it will be fixed.

Last updated: 2026-10-04 (landing page built and checked)

---

## 1. Status board

Legend: **Not started** / **In progress** / **Built** (code written, not yet checked) / **Verified** (checked, see section 6) / **Blocked on Jacob** (needs an account, key or text from you).

| # | Feature (spec section) | Status | Notes |
| --- | --- | --- | --- |
| 0 | Live-documentation log | Built | This file. Updated with every commit. |
| 1 | Project scaffold (Next.js 16, React 19, TypeScript) | Built | Builds cleanly. |
| 2 | Global CSS + shared header/footer (spec 3) | Verified | Landing matches reference, see section 6. |
| 3 | Data files: plans, landing copy, states, price sets (spec 7, 10) | Built | `src/data/`. |
| 4 | Landing page `/` (spec 5) | Verified | Zero style/position differences above the plans section. |
| 5 | Compare plans table (spec 7) | Built | Checked visually at 1440 and 390. |
| 6 | `/join` page and form (spec 6) | Not started | |
| 7 | Sign-up API + database + confirmation email (spec 9, 8) | Not started | Needs Supabase + Resend keys to run live. |
| 8 | `/reserve`, `/confirmed`, Stripe checkout + webhook (spec 8) | Not started | Needs Stripe keys to run live. |
| 9 | Stage-two price test `/confirm/[token]` (spec 10) | Not started | |
| 10 | `/admin` (spec 9, 10) | Not started | |
| 11 | Tracking: Meta pixel, Google tag (spec 11) | In progress | Loader and `track()` helper written; events wired as pages are built. Needs your IDs to run live. |
| 12 | Accessibility pass (spec 3, 14) | Not started | |
| 13 | README / how-tos (spec 14) | Not started | |
| 14 | `/privacy` and `/terms` placeholders (spec 4) | Built | Legal text needed from you. |

---

## 2. Plan and decisions

### Plan in one paragraph
Build the early-access site described in `Family-Guardian-Build-Spec.md` from scratch: Next.js (App Router, TypeScript), one global CSS file ported 1:1 from the reference design, Supabase for sign-ups, Stripe Checkout for the optional $10 deposit, Resend for the confirmation email, Vercel for hosting. The full step-by-step plan lives in the Claude plan file; the steps are the rows of the status board above.

### Decisions (and why)
| Decision | Why |
| --- | --- |
| Everything runs with no keys set. A missing key turns that one feature off with a visible message instead of crashing. | Lets Jacob see and click through the whole site before any account exists. |
| Supabase table is delivered as `supabase/schema.sql` for Jacob to paste into the Supabase SQL editor. Claude does not touch any live Supabase project. | The database is Jacob's real data; he should create it himself. |
| No Tailwind, no UI library. One `globals.css`. | Spec section 2. Keeps the code simple and the look identical to the reference. |
| Reference screenshots do not exist yet, so the reference HTML itself is rendered in Chromium at 1440px and 390px and compared with the built pages. | Spec section 3 verification, adapted. |
| `SHOW_PRICES = false` in `src/config.ts`. Real prices exist only in `src/data/price-sets.ts` and on `/confirm/[token]`. | Spec sections 5 and 10. |
| No pull request is opened unless Jacob asks. Work is committed and pushed to branch `claude/new-session-qsuwaq`. | Instruction from the session. |

### Plan changes
| Date | Change | Reason |
| --- | --- | --- |
| 2026-10-04 | Added this live-documentation log as step 0. | Requested by Jacob. |

---

## 3. Chronological log

### 2026-10-04
- Read the build spec and the reference design file. The repo was empty (no commits).
- Wrote the plan and got it approved. Jacob asked for this live-documentation log to be kept current throughout; added as step 0.
- Created this file (`docs/LIVE-DOCUMENTATION.md`).
- Scaffolded the project by hand: Next.js 16, React 19, TypeScript. Config in `src/config.ts` (`SHOW_PRICES = false`).
- Wrote the data files in `src/data/`. Plans, features and the compare rows live only in `plans.ts`. The reference prices ($15/$35/$100) are in their own server-only file `reference-prices.ts` so they can never be sent to visitors' browsers while prices are hidden.
- Ported the reference styles into `src/app/globals.css` and built the landing page, header, footer and Compare table.
- Checked the landing page against the reference HTML in Chromium at 1440 and 390 wide (see section 6).
- Added a narrower first column for the Compare table on phones so the plan columns are visible and the scroll is obvious.
- Footer "Contact" goes to the top of the page for now (the reference pointed at `#top` too) until a real contact email exists.
- Tracking: `?src=` and `utm_` values are saved whenever a page loads with them in the link, so the most recent tagged link wins.

---

## 4. Open items for Jacob (spec section 13)

- [ ] Company name, contact email, calendar link, domain. (Shown as `[COMPANY NAME]`, `[CONTACT EMAIL]`, `[YOUR SITE URL]`, `[CALENDAR LINK]` until supplied.)
- [ ] Stripe account and keys, Supabase project, Resend account and sending domain.
- [ ] Meta pixel ID and Google tag ID.
- [ ] Legal text for privacy and terms (have a lawyer review).
- [ ] Decide about the Premium feature "Early warning on unusual money patterns". It stays on the page for the test but is not built.
- [ ] Reference screenshots at 1440px and 390px in `/reference` (optional now; Claude renders the reference HTML itself).

---

## 5. How-tos (plain words)

Filled in as each becomes real. Placeholders for now:

- **Run the site on your computer:** _to be written in step 1._
- **Deploy to Vercel:** _to be written in step 13._
- **See who signed up:** _to be written in step 10._
- **Refund a deposit:** _to be written in step 8._

---

## 6. Verification results

### Landing page vs reference (2026-10-04)
Method: the reference file was converted to plain HTML and rendered in Chromium next to the built site at 1440px and 390px. Every matching element's position, size, colors, font, padding, border, radius, letter spacing and line height were compared (95 elements at 1440).
Result: no differences in anything above the plans section. The only differences are the planned spec-5 edits: hero note text, the price slot in the plan cards (cards are 16px shorter at desktop because "Pricing shared before launch" replaces the 40px price), the added Compare table, and the fifth "Pricing" fact row.
Still pending: forms and pages not yet built, price/em-dash scan of all pages, keyboard and accessibility checks.
