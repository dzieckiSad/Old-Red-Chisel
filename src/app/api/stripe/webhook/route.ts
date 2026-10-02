import type { NextRequest } from "next/server";
import { getOrder, markPaid } from "@/lib/orders";
import { stripe } from "@/lib/payments";

// Backup path: marks the order paid and emails the customer even if they close the tab
// before returning from the payment page. Configure in Stripe → Developers → Webhooks
// with the event payment_intent.succeeded.
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  let event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const orderId = intent.metadata?.orderId;
    const order = orderId ? await getOrder(orderId) : null;
    if (order && intent.amount === order.total) await markPaid(order.id, intent.id);
  }
  return Response.json({ received: true });
}
