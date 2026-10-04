import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/supabase";
import { assignPriceSets } from "@/lib/shuffle-assign";

// "Assign price sets" on /admin. Only sign-ups with NO price set yet are
// assigned, so pressing the button again never reshuffles people who already
// got a set (and may already have been emailed).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected." }, { status: 503 });

  const { data, error } = await db.from("signups").select("id").is("price_set", null);
  if (error) return NextResponse.json({ error: "Could not load sign-ups." }, { status: 500 });

  const assignment = assignPriceSets((data ?? []).map((r) => r.id));
  for (const [id, set] of Object.entries(assignment)) {
    const { error: e } = await db.from("signups").update({ price_set: set }).eq("id", id);
    if (e) return NextResponse.json({ error: "Could not save a price set." }, { status: 500 });
  }

  const url = new URL("/admin", req.url);
  url.searchParams.set("assigned", String(Object.keys(assignment).length));
  return NextResponse.redirect(url, 303);
}
