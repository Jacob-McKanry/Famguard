# Family Guardian: early-access site

A demand-test website for a (not yet built) family-paid scam-protection service. It collects free sign-ups and an optional $10 refundable deposit so we can learn which plan families pick and what they would pay.

Built with Next.js (App Router, TypeScript), Supabase (database), Stripe (deposit), Resend (confirmation email), hosted on Vercel.

The full running record of the build is in [`docs/LIVE-DOCUMENTATION.md`](docs/LIVE-DOCUMENTATION.md). Start there to see what is done, what is checked and what still needs you.

## Run it on your computer

```bash
npm install
cp .env.example .env.local     # then fill in what you have; empty is fine
npm run dev                    # open http://localhost:3000
```

With no keys set the whole site still works. Sign-up runs in "demo mode" (nothing saved), and the deposit button says `[STRIPE NOT CONNECTED YET]`.

Checks you can run any time:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Where things live

| What | Where |
| --- | --- |
| Show/hide prices switch | `src/config.ts` (`SHOW_PRICES`, keep `false` for stage one) |
| Plan names, features, compare table | `src/data/plans.ts` (the only place to edit plan copy) |
| Landing page copy | `src/data/landing.ts` |
| Stage-two prices | `src/data/price-sets.ts` |
| All styling | `src/app/globals.css` |
| Database table | `supabase/schema.sql` |

## Supabase (database): already created

A project named **family-guardian** exists in your Supabase account (`https://pfvdnefygpffmqfytnyx.supabase.co`) with the `signups` table already set up and locked down (only the server can read or write it).

You need one secret from it:
1. Supabase, open **family-guardian**, then **Project Settings**, then **API Keys**.
2. Copy the **service_role** secret key. Treat it like a password. Never paste it into the code or share it.

## Deploy to Vercel (you click, about 10 minutes)

Claude could not do this step for you: the connected Vercel tools cannot create projects or set environment variables.

1. Go to vercel.com, **Add New**, then **Project**, and import the GitHub repo `Jacob-McKanry/Famguard`.
2. Framework preset: **Next.js** (it detects this by itself). Leave build settings as they are.
3. Under **Environment Variables**, add these (names exactly as shown):

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | `https://pfvdnefygpffmqfytnyx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key from above |
   | `ADMIN_PASSWORD` | a long password you make up (this protects `/admin`) |
   | `NEXT_PUBLIC_SITE_URL` | your site address, no trailing slash (set after first deploy if you do not know it yet, then redeploy) |
   | `STRIPE_SECRET_KEY` | later, from Stripe (use a `sk_test_...` key first) |
   | `STRIPE_WEBHOOK_SECRET` | later, see "Stripe" below |
   | `RESEND_API_KEY` and `EMAIL_FROM` | later, from Resend |
   | `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_TAG_ID` | later, when you have them |
   | `CALENDAR_LINK` | your booking link |

   Anything you leave out simply switches that one feature off. The site still works.
4. Click **Deploy**. Environment changes only take effect after a new deploy (Deployments, three dots, Redeploy).

Important: do not leave `SUPABASE_SERVICE_ROLE_KEY` empty on the live site. Without it sign-ups are not saved, and the live site shows an error instead of pretending it worked.

## Stripe (the $10 deposit)

1. In Stripe, stay in **Test mode**. Copy the secret key (`sk_test_...`) into `STRIPE_SECRET_KEY`.
2. Developers, **Webhooks**, **Add endpoint**: URL `https://YOUR-SITE/api/stripe-webhook`, event `checkout.session.completed`. Copy its **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.
3. Test with card `4242 4242 4242 4242`, any future date, any CVC. The sign-up row should change to `deposit_status = paid`.

## See who signed up

Open `https://YOUR-SITE/admin` and enter your `ADMIN_PASSWORD`. You get a sortable table, a per-plan summary (sign-ups, deposits, median and 25th to 75th percentile of what people typed) and a **Download CSV** button. You can also look at the `signups` table directly in Supabase, Table Editor.

## Refund a deposit

1. In the Stripe dashboard, Payments, find the payment (search the person's email), then **Refund**.
2. Update the sign-up row so your numbers stay right: Supabase, Table Editor, `signups`, set `deposit_status` to `refunded` for that row.

## Stage two (price test, later)

1. In `/admin`, press **Assign price sets**. It randomly splits sign-ups into A and B (and never reshuffles people who already have a set).
2. Press **Download email list with links** and use that CSV to email each person their private confirm link.
3. Prices appear only on that private page. They never show on public pages while `SHOW_PRICES` is `false`.

## Things still needing your input

See section 4 of `docs/LIVE-DOCUMENTATION.md`: company name, contact email, calendar link, domain, Stripe, Resend, analytics IDs, and legal text for `/privacy` and `/terms`.
