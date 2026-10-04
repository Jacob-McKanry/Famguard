import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/supabase";
import { toCsv } from "@/lib/csv";

// "Download CSV" on /admin: every sign-up, newest first.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected." }, { status: 503 });

  const { data, error } = await db.from("signups").select("*").order("created_at", { ascending: false }).limit(10000);
  if (error) return NextResponse.json({ error: "Could not load sign-ups." }, { status: 500 });

  const columns = [
    "created_at", "first_name", "email", "plan", "typed_monthly_amount", "not_sure", "who_for", "state",
    "worry", "consent", "src", "utm_source", "utm_medium", "utm_campaign", "deposit_status",
    "stripe_session_id", "price_set", "price_confirmed_at", "price_feedback",
  ].map((key) => ({ key, label: key }));

  return new NextResponse(toCsv(columns, data ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="signups.csv"',
      "Cache-Control": "no-store",
    },
  });
}
