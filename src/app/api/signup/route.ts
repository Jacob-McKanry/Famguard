import { NextResponse } from "next/server";
import { getDb, DEMO_MODE_ALLOWED } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";
import { validateSignup, type SignupInput } from "@/lib/validation";
import { buildSignupRow, cleanAttribution } from "@/lib/signup-row";
import { STATES } from "@/data/states";
import { getPlan } from "@/data/plans";

// Saves a sign-up. A repeat email updates the existing row (spec section 9).
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Hidden "honeypot" field: real people never fill it in, bots often do.
  // Pretend it worked so the bot learns nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, id: "ignored" });
  }

  const input: SignupInput = {
    plan: String(body.plan ?? ""),
    amount: String(body.amount ?? ""),
    notSure: body.notSure === true,
    firstName: String(body.firstName ?? ""),
    email: String(body.email ?? ""),
    whoFor: String(body.whoFor ?? ""),
    state: String(body.state ?? ""),
    worry: String(body.worry ?? ""),
    consent: body.consent === true,
  };

  // Always re-check on the server. The browser check is only a convenience.
  const errors = validateSignup(input, STATES);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    if (DEMO_MODE_ALLOWED) {
      console.warn("[signup] Supabase is not configured. Demo mode: nothing was saved.");
      return NextResponse.json({ ok: true, id: "demo", demo: true });
    }
    return NextResponse.json({ error: "Sign-up is not connected yet. Please try again later." }, { status: 503 });
  }

  const row = buildSignupRow(input, cleanAttribution(body.attribution as Record<string, unknown> | null));

  // Existing sign-up with this email?
  const { data: existing, error: lookupError } = await db
    .from("signups")
    .select("id")
    .eq("email", row.email)
    .maybeSingle();
  if (lookupError) {
    console.error("[signup] lookup failed", lookupError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  if (existing) {
    // Keep the original source info if this visit did not carry any.
    const changes: Record<string, unknown> = { ...row };
    for (const k of ["src", "utm_source", "utm_medium", "utm_campaign"] as const) {
      if (changes[k] === null) delete changes[k];
    }
    const { error } = await db.from("signups").update(changes).eq("id", existing.id);
    if (error) {
      console.error("[signup] update failed", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: existing.id });
  }

  const { data: created, error: insertError } = await db.from("signups").insert(row).select("id").single();
  if (insertError || !created) {
    console.error("[signup] insert failed", insertError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // Only brand-new sign-ups get the email. A failed email must not fail the sign-up.
  const result = await sendConfirmationEmail({
    to: row.email,
    firstName: row.first_name,
    planName: getPlan(row.plan)?.name ?? row.plan,
  });
  if (!result.sent) console.warn("[signup] confirmation email not sent:", result.reason);

  return NextResponse.json({ ok: true, id: created.id });
}
