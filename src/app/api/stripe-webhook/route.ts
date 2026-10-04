import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

// Stripe calls this URL after a payment. We check the signature, so only
// real Stripe messages are believed, then mark the sign-up's deposit as paid.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const db = getDb();
  if (!stripe || !secret || !db) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text(); // must be the raw text for the signature check
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const signupId = session.metadata?.signup_id;
    if (signupId && session.payment_status === "paid") {
      const { error } = await db.from("signups").update({ deposit_status: "paid", stripe_session_id: session.id }).eq("id", signupId);
      if (error) {
        console.error("[stripe-webhook] could not mark paid", error);
        return NextResponse.json({ error: "Database error." }, { status: 500 }); // Stripe will retry
      }
    }
  }

  return NextResponse.json({ received: true });
}
