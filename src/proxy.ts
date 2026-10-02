import { type NextRequest, NextResponse } from "next/server";

// The admin panel lives at a secret path set only in the environment (ADMIN_PATH), never in
// the code. Requests to that path are rewritten to the internal admin routes; the internal
// routes themselves always answer 404, so the panel can't be found by reading the source.
// The path is only the first lock: every admin page and action also requires a password and
// an authenticator code (see src/lib/admin-auth.ts).

const INTERNAL = "/orc-admin-internal";

function adminSlug() {
  const slug = process.env.ADMIN_PATH?.replace(/^\/+|\/+$/g, "");
  return slug && /^[A-Za-z0-9_-]{12,}$/.test(slug) ? slug : null;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  }

  const slug = adminSlug();
  if (slug && (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`))) {
    const rest = pathname.slice(slug.length + 1);
    const headers = new Headers(request.headers);
    headers.set("x-admin-base", `/${slug}`);
    const response = NextResponse.rewrite(new URL(`${INTERNAL}${rest}${search}`, request.url), { request: { headers } });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|icon.svg|robots.txt|sitemap.xml).*)"],
};
