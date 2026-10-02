import { NextResponse, type NextRequest } from "next/server";
import { grantGatePass, redeemTicket, requestAdminBase } from "@/lib/admin-auth";

// Opened by `npm run admin` with a one-time ticket. A valid ticket gives this browser a pass
// to see the sign-in page; anything else looks exactly like a page that doesn't exist.
export async function GET(request: NextRequest) {
  const base = await requestAdminBase();
  const ticket = request.nextUrl.searchParams.get("ticket") ?? "";
  if (!base || !ticket || !(await redeemTicket(ticket))) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
  }
  await grantGatePass(base);
  return NextResponse.redirect(new URL(base, request.url), 303);
}
