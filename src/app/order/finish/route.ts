import { NextResponse, type NextRequest } from "next/server";
import { startTrackingSession, stashPasswordForDisplay } from "@/lib/customer-session";
import { getOrder, markPaid, revealCredentials } from "@/lib/orders";
import { paymentMode, stripe } from "@/lib/payments";

// Stripe sends the customer here after payment (?order=<id>&payment_intent=...).
// We confirm the payment with Stripe ourselves rather than trusting the query string.
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order") ?? "";
  const back = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  const order = /^[0-9a-f-]{36}$/i.test(orderId) ? await getOrder(orderId) : null;
  if (!order) return back("/checkout?error=not-found");

  if (order.status === "pending_payment") {
    if (paymentMode() !== "stripe" || !order.paymentRef) return back("/checkout?error=payment");
    const intent = await stripe().paymentIntents.retrieve(order.paymentRef);
    if (intent.metadata.orderId !== order.id || intent.amount !== order.total) return back("/checkout?error=payment");
    if (intent.status === "processing") {
      await startTrackingSession(order.id);
      return back("/order/confirmed?pending=1");
    }
    if (intent.status !== "succeeded") return back("/checkout?error=payment");
    await markPaid(order.id, intent.id);
  }

  await startTrackingSession(order.id);
  const password = await revealCredentials(order.id);
  if (password) await stashPasswordForDisplay(order.id, password);
  return back("/order/confirmed");
}
