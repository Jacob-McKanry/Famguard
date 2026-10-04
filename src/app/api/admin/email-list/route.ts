import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/supabase";
import { toCsv } from "@/lib/csv";
import { getPlan } from "@/data/plans";

// "Download email list with links": one row per sign-up that has a price set,
// with that person's private confirm link.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected." }, { status: 503 });

  const { data, error } = await db
    .from("signups")
    .select("email, first_name, plan, typed_monthly_amount, not_sure, price_set, confirm_token")
    .not("price_set", "is", null)
    .order("created_at", { ascending: true })
    .limit(10000);
  if (error) return NextResponse.json({ error: "Could not load sign-ups." }, { status: 500 });

  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = configured && configured.startsWith("http") ? configured.replace(/\/$/, "") : new URL(req.url).origin;

  const rows = (data ?? []).map((r) => ({
    email: r.email,
    first_name: r.first_name,
    plan: getPlan(r.plan)?.name ?? r.plan,
    typed_amount: r.not_sure ? "Not sure" : r.typed_monthly_amount,
    price_set: r.price_set,
    confirm_link: `${origin}/confirm/${r.confirm_token}`,
  }));
  const columns = [
    { key: "email", label: "email" }, { key: "first_name", label: "first name" }, { key: "plan", label: "plan" },
    { key: "typed_amount", label: "typed amount" }, { key: "price_set", label: "price set" }, { key: "confirm_link", label: "personal confirm link" },
  ];

  return new NextResponse(toCsv(columns, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="email-list-with-links.csv"',
      "Cache-Control": "no-store",
    },
  });
}
