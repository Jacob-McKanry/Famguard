// Server-side database connection. NEVER import this from a "use client" file:
// it uses the secret service key.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Returns null when Supabase is not set up yet, so callers can show a friendly message.
export function getDb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// In local development with no database, the sign-up flow can keep going
// ("demo mode") so you can click through the whole site. Never in production,
// where a lost sign-up would be silent.
export const DEMO_MODE_ALLOWED = process.env.NODE_ENV !== "production";
