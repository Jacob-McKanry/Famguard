// Protects /admin with one password (ADMIN_PASSWORD).
// After login we store a cookie holding a keyed hash of a fixed phrase. The
// password itself is never stored in the cookie. Anyone without the password
// cannot make a valid cookie.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fg_admin";

function token(password: string): string {
  return createHmac("sha256", password).update("family-guardian-admin").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordMatches(attempt: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  // Compare hashes so lengths always match
  return safeEqual(token(attempt), token(real));
}

export function makeAdminCookieValue(): string {
  return token(process.env.ADMIN_PASSWORD ?? "");
}

export async function isAdmin(): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value;
  return Boolean(value) && safeEqual(value as string, token(real));
}
