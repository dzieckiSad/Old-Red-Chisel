import type { Metadata } from "next";
import { OrderTracker } from "@/components/order-tracker";
import { CheckList, Container, PageHeader } from "@/components/ui";
import { TrackLogin } from "@/components/track-login";
import { trackedOrder } from "@/lib/customer-session";
import { getOrderEvents } from "@/lib/orders";
import { trackLogout } from "./actions";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Follow your Old Red Chisel order from the workshop to your door.",
};

export default async function TrackPage() {
  const order = await trackedOrder();

  if (order && order.status !== "pending_payment") {
    const events = await getOrderEvents(order.id);
    return (
      <>
        <PageHeader eyebrow="Track your order" title={`Hi ${order.customerName.split(" ")[0]}`} />
        <Container className="py-12">
          <OrderTracker order={order} events={events} />
          <form action={trackLogout} className="mt-10">
            <button type="submit" className="text-sm font-semibold text-graphite underline hover:text-ink">
              Sign out of this order
            </button>
          </form>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Track your order"
        title="Where's my order?"
        intro="No account needed: your order number and password came by email right after you paid."
      />
      <Container className="grid items-start gap-10 py-12 md:grid-cols-[1.2fr_1fr]">
        <TrackLogin />
        <div className="space-y-4 text-graphite">
          <h2 className="font-serif text-xl font-semibold text-ink">What you&apos;ll see</h2>
          <CheckList
            items={[
              "Where your order is: workshop, on the way or ready to collect",
              "The expected delivery or collection date",
              "Notes from the team as your piece is made",
              "Everything you ordered and paid",
            ]}
          />
          <p className="pt-2 text-sm">Lost your password? Call or WhatsApp us with your order number and we&apos;ll help.</p>
        </div>
      </Container>
    </>
  );
}
