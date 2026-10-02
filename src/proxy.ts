import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_INTERNAL, ADMIN_PATH } from "@/lib/admin-config";

// The admin panel is served at /admin from the internal admin routes, which answer 404 when
// requested directly. Every admin page and action also requires signing in.

function within(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (within(pathname, ADMIN_INTERNAL)) {
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  }
  if (!within(pathname, ADMIN_PATH)) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("x-admin-base", ADMIN_PATH);
  const rest = pathname.slice(ADMIN_PATH.length);
  const response = NextResponse.rewrite(new URL(`${ADMIN_INTERNAL}${rest}${search}`, request.url), { request: { headers } });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|icon.svg|robots.txt|sitemap.xml).*)"],
};
