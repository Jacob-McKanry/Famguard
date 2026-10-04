import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeAdminCookieValue, passwordMatches } from "@/lib/admin-auth";

// Form post from the /admin login box.
export async function POST(req: Request) {
  const form = await req.formData();
  const attempt = String(form.get("password") ?? "");
  const url = new URL("/admin", req.url);
  if (!passwordMatches(attempt)) {
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(ADMIN_COOKIE, makeAdminCookieValue(), {
    httpOnly: true, // JavaScript on the page cannot read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return res;
}
