import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_INTERNAL, ADMIN_PATH } from "@/lib/admin-config";
import { SITE_LOCK_COOKIE, UNLOCK_PATH, sitePassword, unlockToken } from "@/lib/site-lock";

// The admin panel is served at /admin from the internal admin routes, which answer 404 when
// requested directly. Every admin page and action also requires signing in.

function within(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Private preview: everything asks for SITE_PASSWORD first (see src/lib/site-lock.ts).
  const password = sitePassword();
  if (password && pathname !== UNLOCK_PATH && request.cookies.get(SITE_LOCK_COOKIE)?.value !== (await unlockToken(password))) {
    if (request.method !== "GET" && request.method !== "HEAD") return new NextResponse("Locked", { status: 401 });
    const url = new URL(UNLOCK_PATH, request.url);
    url.search = "";
    url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url, 307);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

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
