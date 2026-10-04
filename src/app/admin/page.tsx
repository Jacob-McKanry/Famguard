import { isAdmin, adminConfigured } from "@/lib/admin-auth";
import { getDb } from "@/lib/supabase";
import { summarizeByPlan } from "@/lib/stats";
import { PLANS, getPlan } from "@/data/plans";

export const metadata = { title: "Admin | Family Guardian", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  created_at: string;
  first_name: string;
  email: string;
  plan: string;
  typed_monthly_amount: number | string | null;
  not_sure: boolean;
  who_for: string;
  state: string;
  worry: string | null;
  src: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  deposit_status: string;
  price_set: string | null;
  price_confirmed_at: string | null;
  price_feedback: string | null;
};

// Table columns: key to sort by, label, how to show the value
const COLUMNS: { key: keyof Row; label: string; show: (r: Row) => string }[] = [
  { key: "created_at", label: "Joined", show: (r) => new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ") },
  { key: "first_name", label: "Name", show: (r) => r.first_name },
  { key: "email", label: "Email", show: (r) => r.email },
  { key: "plan", label: "Plan", show: (r) => getPlan(r.plan)?.name ?? r.plan },
  { key: "typed_monthly_amount", label: "Would pay", show: (r) => (r.not_sure ? "Not sure" : r.typed_monthly_amount === null ? "" : `$${Number(r.typed_monthly_amount)}`) },
  { key: "who_for", label: "For", show: (r) => r.who_for },
  { key: "state", label: "State", show: (r) => r.state },
  { key: "src", label: "Source", show: (r) => r.src ?? "" },
  { key: "utm_campaign", label: "Campaign", show: (r) => r.utm_campaign ?? "" },
  { key: "deposit_status", label: "Deposit", show: (r) => r.deposit_status },
  { key: "price_set", label: "Set", show: (r) => r.price_set ?? "" },
  { key: "price_confirmed_at", label: "Confirmed", show: (r) => (r.price_confirmed_at ? "yes" : "") },
  { key: "price_feedback", label: "Price feedback", show: (r) => r.price_feedback ?? "" },
  { key: "worry", label: "Worry", show: (r) => r.worry ?? "" },
];

const money = (n: number | null) => (n === null ? "none yet" : `$${Number.isInteger(n) ? n : n.toFixed(2)}`);

function sortRows(rows: Row[], key: keyof Row, dir: "asc" | "desc"): Row[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av === null || av === undefined) return 1; // empty values always last
    if (bv === null || bv === undefined) return -1;
    if (key === "typed_monthly_amount") return (Number(av) - Number(bv)) * mult;
    return String(av).localeCompare(String(bv)) * mult;
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; assigned?: string; error?: string }>;
}) {
  const sp = await searchParams;

  // ---- Not set up / not logged in ----
  if (!adminConfigured()) {
    return (
      <div className="admin-wrap">
        <h1>Admin</h1>
        <p>The admin page is switched off. Set the <code>ADMIN_PASSWORD</code> environment variable to turn it on.</p>
      </div>
    );
  }
  if (!(await isAdmin())) {
    return (
      <div className="admin-wrap" style={{ maxWidth: 480 }}>
        <h1>Admin</h1>
        <form method="post" action="/api/admin/login" className="card">
          <div className={`field ${sp.error ? "has-error" : ""}`}>
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" className="input" autoComplete="current-password" required />
            {sp.error && <p className="error-msg" role="alert">That password is not right.</p>}
          </div>
          <button type="submit" className="btn btn-green" style={{ padding: "12px 24px", fontSize: 17 }}>Log in</button>
        </form>
      </div>
    );
  }

  // ---- Logged in ----
  const db = getDb();
  if (!db) {
    return (
      <div className="admin-wrap">
        <h1>Admin</h1>
        <p>The database is not connected yet. Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>.</p>
      </div>
    );
  }
  const { data, error } = await db.from("signups").select("*").order("created_at", { ascending: false }).limit(10000);
  if (error) {
    return <div className="admin-wrap"><h1>Admin</h1><p>Could not load sign-ups: {error.message}</p></div>;
  }

  const rows = (data ?? []) as Row[];
  const sortKey = (COLUMNS.find((c) => c.key === sp.sort)?.key ?? "created_at") as keyof Row;
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";
  const sorted = sortRows(rows, sortKey, dir);
  const summary = summarizeByPlan(rows, PLANS.map((p) => p.id));

  return (
    <div className="admin-wrap">
      <h1 style={{ margin: "0 0 4px" }}>Admin</h1>
      <p style={{ margin: 0, color: "#5b6a60" }}>{rows.length} sign-ups in total.</p>
      {sp.assigned && <p role="status"><strong>Assigned price sets to {sp.assigned} sign-ups.</strong></p>}

      <div className="admin-summary">
        {summary.map((s) => (
          <div className="card" key={s.plan} style={{ padding: 20 }}>
            <div className="eyebrow">{getPlan(s.plan)?.name}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{s.signups} <span style={{ fontSize: 16, fontWeight: 400 }}>sign-ups</span></div>
            <div>{s.deposits} paid deposits</div>
            <div style={{ marginTop: 8 }}>
              Typed amount, median: <strong>{money(s.median)}</strong>
            </div>
            <div>25th to 75th percentile: {s.p25 === null ? "none yet" : `${money(s.p25)} to ${money(s.p75)}`}</div>
            <div style={{ color: "#5b6a60", fontSize: 15 }}>from {s.amountsCount} answers, {s.notSure} not sure</div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <a className="btn btn-green" style={{ padding: "10px 18px", fontSize: 16 }} href="/api/admin/csv">Download CSV</a>
        <form method="post" action="/api/admin/assign">
          <button type="submit" className="btn btn-outline">Assign price sets</button>
        </form>
        <a className="btn btn-outline" href="/api/admin/email-list">Download email list with links</a>
        <form method="post" action="/api/admin/logout" style={{ marginLeft: "auto" }}>
          <button type="submit" className="btn btn-outline">Log out</button>
        </form>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              {COLUMNS.map((c) => {
                const active = c.key === sortKey;
                const nextDir = active && dir === "desc" ? "asc" : "desc";
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
                    <a href={`/admin?sort=${c.key}&dir=${nextDir}`}>{c.label}{active ? (dir === "asc" ? " ▲" : " ▼") : ""}</a>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                {COLUMNS.map((c) => <td key={c.key}>{c.show(r)}</td>)}
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={COLUMNS.length}>No sign-ups yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
