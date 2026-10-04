import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Stage-two price test: "Confirm my spot" or "This price doesn't work for us".
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Not connected yet." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "");
  if (!UUID_RE.test(token)) return NextResponse.json({ error: "Invalid link." }, { status: 400 });

  const { data: signup } = await db.from("signups").select("id, price_set").eq("confirm_token", token).maybeSingle();
  if (!signup || !signup.price_set) return NextResponse.json({ error: "This link isn't active yet." }, { status: 404 });

  if (body.action === "confirm") {
    const { error } = await db.from("signups").update({ price_confirmed_at: new Date().toISOString() }).eq("id", signup.id);
    if (error) return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "feedback") {
    const text = String(body.text ?? "").trim().slice(0, 1000);
    if (!text) return NextResponse.json({ error: "Please type a short reply." }, { status: 400 });
    const { error } = await db.from("signups").update({ price_feedback: text }).eq("id", signup.id);
    if (error) return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Bad request." }, { status: 400 });
}
