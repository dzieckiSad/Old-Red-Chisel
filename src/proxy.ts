import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_INTERNAL, TEMP_SIMPLE_ADMIN_PATH, secretAdminPath } from "@/lib/admin-config";

// The admin panel lives at a secret path set only in the environment (ADMIN_PATH), never in
// the code. Requests to it are rewritten to the internal admin routes, which always answer
// 404 when requested directly. On the secret path the panel also stays hidden until the
// browser holds a pass from `npm run admin` (see src/lib/admin-auth.ts), and signing in
// still needs a password and an authenticator code.

function within(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (within(pathname, ADMIN_INTERNAL)) {
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  }

  const secret = secretAdminPath();
  const base =
    secret && within(pathname, secret) ? secret
    : TEMP_SIMPLE_ADMIN_PATH && within(pathname, TEMP_SIMPLE_ADMIN_PATH) ? TEMP_SIMPLE_ADMIN_PATH
    : null;
  if (!base) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("x-admin-base", base);
  const rest = pathname.slice(base.length);
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
