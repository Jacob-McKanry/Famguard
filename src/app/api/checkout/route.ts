import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { DEPOSIT_DOLLARS } from "@/config";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Creates a Stripe Checkout page for the one-time $10 refundable deposit.
export async function POST(req: Request) {
  const stripe = getStripe();
  const db = getDb();
  if (!stripe || !db) {
    return NextResponse.json({ error: "Deposits are not connected yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const sid = String(body.sid ?? "");
  if (!UUID_RE.test(sid)) {
    return NextResponse.json({ error: "We could not find your sign-up. Please join again." }, { status: 400 });
  }

  const { data: signup } = await db.from("signups").select("id, email, deposit_status").eq("id", sid).maybeSingle();
  if (!signup) {
    return NextResponse.json({ error: "We could not find your sign-up. Please join again." }, { status: 404 });
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = configured && configured.startsWith("http") ? configured.replace(/\/$/, "") : new URL(req.url).origin;

  if (signup.deposit_status === "paid") {
    return NextResponse.json({ url: `${origin}/confirmed?paid=1` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: signup.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: DEPOSIT_DOLLARS * 100, // Stripe wants cents
          product_data: { name: "Family Guardian early-access deposit (fully refundable)" },
        },
      },
    ],
    metadata: { signup_id: signup.id },
    success_url: `${origin}/confirmed?paid=1`,
    cancel_url: `${origin}/reserve?sid=${signup.id}`,
  });

  await db.from("signups").update({ deposit_status: "pending", stripe_session_id: session.id }).eq("id", signup.id);

  return NextResponse.json({ url: session.url });
}
