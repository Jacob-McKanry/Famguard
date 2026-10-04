# Family Guardian: Live Documentation

This file is the running record of the build. It is updated in the same commit as every feature, plan change, decision or environment variable change. If this file and the code ever disagree, tell Claude and it will be fixed.

Last updated: 2026-10-04 (Supabase live; Vercel needs Jacob's clicks)

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
| 5 | Compare plans table (spec 7) | Verified | Checked at 1440 and 390; keyboard-scrollable; passes accessibility scan. |
| 6 | `/join` page and form (spec 6) | Verified | Browser-tested: plan preselect, label updates, Not sure, email blur message, error style, keyboard-only, mobile bar. |
| 7 | Sign-up API + database + confirmation email (spec 9, 8) | In progress | Supabase project and table are LIVE and checked in the database. App-to-database save and email not yet tested (needs service key on Vercel + Resend key). |
| 8 | `/reserve`, `/confirmed`, Stripe checkout + webhook (spec 8) | Built | Pages checked. Stripe-missing state checked. Test-mode payment not yet tested (needs Stripe keys). |
| 9 | Stage-two price test `/confirm/[token]` (spec 10) | Built | Needs live database to test end to end. |
| 10 | `/admin` (spec 9, 10) | Built | Login, table, sorting, CSV, summary, assign, email list written. Needs live database to test. |
| 11 | Tracking: Meta pixel, Google tag (spec 11) | In progress | Loader and `track()` helper written; events wired as pages are built. Needs your IDs to run live. |
| 12 | Accessibility pass (spec 3, 14) | Verified | axe scan: zero violations on `/`, `/join`, `/reserve`, `/confirmed`, `/privacy` at 1440 and 390. |
| 13 | README / how-tos (spec 14) | Built | `README.md`: run locally, Supabase, Vercel click-path, Stripe, admin, refund. |
| 14 | `/privacy` and `/terms` placeholders (spec 4) | Built | Legal text needed from you. |
| 15 | Supabase project + table | Verified | Project `family-guardian` (`pfvdnefygpffmqfytnyx`, us-east-1). See section 6. |
| 16 | Vercel deployment | Blocked on Jacob | Connected Vercel tools cannot create projects or set env vars. Click-path in `README.md`. |

---

## 2. Plan and decisions

### Plan in one paragraph
Build the early-access site described in `Family-Guardian-Build-Spec.md` from scratch: Next.js (App Router, TypeScript), one global CSS file ported 1:1 from the reference design, Supabase for sign-ups, Stripe Checkout for the optional $10 deposit, Resend for the confirmation email, Vercel for hosting. The full step-by-step plan lives in the Claude plan file; the steps are the rows of the status board above.

### Decisions (and why)
| Decision | Why |
| --- | --- |
| Everything runs with no keys set. A missing key turns that one feature off with a visible message instead of crashing. | Lets Jacob see and click through the whole site before any account exists. |
| Supabase table lives in `supabase/schema.sql`. **Changed 2026-10-04:** Jacob said Claude may set up Supabase and Vercel through the connected tools, so Claude will apply the schema and deploy (after looking at what already exists in the accounts first). | Jacob's instruction. |
| No Tailwind, no UI library. One `globals.css`. | Spec section 2. Keeps the code simple and the look identical to the reference. |
| Reference screenshots do not exist yet, so the reference HTML itself is rendered in Chromium at 1440px and 390px and compared with the built pages. | Spec section 3 verification, adapted. |
| `SHOW_PRICES = false` in `src/config.ts`. Real prices exist only in `src/data/price-sets.ts` and on `/confirm/[token]`. | Spec sections 5 and 10. |
| No pull request is opened unless Jacob asks. Work is committed and pushed to branch `claude/new-session-qsuwaq`. | Instruction from the session. |

### Plan changes
| Date | Change | Reason |
| --- | --- | --- |
| 2026-10-04 | Added this live-documentation log as step 0. | Requested by Jacob. |
| 2026-10-04 | Supabase and Vercel setup moved from "Jacob does it" to "Claude does it" after the code is built. | Jacob: "you can build vercel and supabase out too, you have the connections." |
| 2026-10-04 | Added a unique index on lower(email) to the schema. | Makes "one row per email" a database rule, not just app logic. |
| 2026-10-04 | Compare table "No" colour changed from `#8a948d` to `#667069`. | The spec colour fails the WCAG contrast minimum (3.1 to 1, needs 4.5 to 1) and the spec also asks for an accessibility score of 95 or more. |

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
- Wrote the server code: validation, sign-up API (duplicate email updates the existing row), Stripe checkout + webhook, Resend email, price-test confirm API, admin login (one password, httpOnly cookie), CSV downloads, price-set assignment, percentile maths.
- Built `/join` (plan cards, compare drawer, form, sticky summary), `/reserve`, `/confirmed`, `/confirm/[token]`, `/admin`.
- Without a database the sign-up API runs in demo mode in development only (nothing saved, goes on to /reserve). In production without a database it returns an error instead, so a lost sign-up is never silent.
- Added 12 unit tests (`npm test`) and browser tests; found and fixed two accessibility problems (low-contrast "No", table not keyboard-scrollable).
- Jacob asked Claude to also set up Supabase and Vercel. Created Supabase project `family-guardian` (after Jacob chose "create new project"), applied the `signups` table migration, and checked it (section 6).
- Searched the connected Vercel tools: they cover connectors, domains and CI only, with no create-project, deploy or environment-variable tools. Wrote the exact click-path in `README.md` instead. No deployment exists yet.
- Wrote `README.md` and put the (non-secret) Supabase URL in `.env.example`. The service role key is a secret and is not stored anywhere in the repo.
- A test row (`dup-test@example.com`) that Claude inserted to check the table could not be deleted: three delete attempts through the Supabase tool timed out. See section 4.
- Tracking: `?src=` and `utm_` values are saved whenever a page loads with them in the link, so the most recent tagged link wins.

---

## 4. Open items for Jacob (spec section 13)

- [ ] **Vercel**: import the repo and add the environment variables (`README.md`, "Deploy to Vercel"). Needs the Supabase **service_role** key from the Supabase dashboard (Project Settings, API Keys).
- [ ] **Clean up one test row** in Supabase. Run this in Supabase, SQL Editor: `delete from public.signups where email = 'dup-test@example.com';` (Claude's three attempts through the tool timed out; cause unknown.) It is fake data, but delete it before real sign-ups so your counts start at zero.

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

### Supabase checks (2026-10-04)
Run directly in the `family-guardian` database through the Supabase tool:
- Table `public.signups` exists with row level security on (the only advisor note is "RLS enabled, no policy", which is intended: nobody but the server can touch it).
- A minimal insert gets the right defaults (`deposit_status = none`, a generated `confirm_token`).
- A second insert with the same email in different capitals is rejected by the unique index.
- Acting as the public `anon` key: sees 0 rows although a row exists, and an insert is rejected by row level security.
- Could not test from the sandbox over the internet: its network policy blocks `*.supabase.co`. So the app's own save-to-database call has not been run.

### Site-wide checks (2026-10-04)
- `npm run typecheck`, `npm run lint`, `npm run build`: pass.
- `npm test`: 12 of 12 pass (validation, amount rules, email message, null amount when Not sure, percentiles/median, per-plan summary, CSV escaping and formula guard, A/B assignment, plan data consistency).
- Price scan of the rendered HTML of `/`, `/join`, `/join?plan=basic`, `/reserve`, `/confirmed`, `/privacy`, `/terms` plus the client JavaScript bundles: the only dollar amounts are `$10` and `$7.7B`. No `$15/$35/$100/$29/$39/$49/$129/$149` anywhere.
- No em dashes in any page or source copy.
- Browser tests (Chromium, 1440 and 390): 28 behaviour checks pass, including keyboard-only use of `/join` and `src`/`utm` values surviving from the landing page to the submit request.
- Accessibility: axe-core (the engine Lighthouse uses for its accessibility score) reports zero violations on 5 pages at both widths. A literal Lighthouse run has not been done yet.
- Not yet verified: live Supabase save, Stripe test deposit marking `paid`, real email arriving, `/admin` against real rows, CSV download.
