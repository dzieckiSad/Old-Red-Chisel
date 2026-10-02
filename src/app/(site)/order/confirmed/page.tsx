import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClearCart } from "@/components/clear-cart";
import { CopyButton } from "@/components/copy-button";
import { SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, PencilNote, SketchUnderline } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { ButtonLink, Container } from "@/components/ui";
import { stashedPassword, trackedOrder } from "@/lib/customer-session";
import { deliveryLabels, formatCents } from "@/lib/order-status";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderConfirmedPage({ searchParams }: PageProps<"/order/confirmed">) {
  const order = await trackedOrder();
  if (!order) redirect("/track");
  const { pending } = await searchParams;
  const password = await stashedPassword(order.id);
  const processing = pending === "1" && order.status === "pending_payment";

  return (
    <Container className="max-w-3xl py-14">
      <ClearCart />
      <Reveal className="text-center">
        <SketchIcon name="houseCheck" size={80} className="mx-auto" />
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
          {processing ? "Payment processing" : <>Thank you, <SketchUnderline>{order.customerName.split(" ")[0]}</SketchUnderline></>}
        </h1>
        <p className="mt-4 text-lg text-graphite">
          {processing
            ? "Your bank is still confirming the payment. We'll email you as soon as it's through."
            : "Your order is confirmed. Here's how to follow it from the workshop to your door."}
        </p>
      </Reveal>

      <section className="relative mt-10 border-2 border-ink bg-white p-6 sm:p-8">
        <CornerMarks />
        <PencilNote className="text-brand">keep these safe</PencilNote>
        <dl className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-graphite">Order number</dt>
            <dd className="mt-1 flex items-center justify-between gap-3 border-b-2 border-dashed border-line pb-2">
              <span className="font-mono text-2xl font-semibold tracking-wider">{order.code}</span>
              <CopyButton text={order.code} label="order number" />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-graphite">Password</dt>
            <dd className="mt-1 flex items-center justify-between gap-3 border-b-2 border-dashed border-line pb-2">
              {password ? (
                <>
                  <span className="font-mono text-2xl font-semibold tracking-wider">{password}</span>
                  <CopyButton text={password} label="password" />
                </>
              ) : (
                <span className="text-sm text-graphite">Sent to {order.email}</span>
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-5 flex gap-2 text-sm text-graphite">
          <SketchIcon name="mail" size={22} />
          We&apos;ve also emailed these to <strong className="text-ink">{order.email}</strong>. Use them at any time on the
          “Track order” page to see where your order is.
        </p>
      </section>

      <section className="mt-8 border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Order summary</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4 py-2.5">
              <span>
                {item.quantity} × {item.name}
                {Object.keys(item.options).length > 0 && (
                  <span className="block text-graphite">{Object.values(item.options).join(" · ")}</span>
                )}
              </span>
              <span className="font-medium">{formatCents(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between py-2.5 text-graphite">
            <span>{deliveryLabels[order.deliveryMethod]}</span>
            <span>{order.deliveryFee === 0 ? "Free" : formatCents(order.deliveryFee)}</span>
          </li>
          <li className="flex justify-between pt-3 text-base font-semibold">
            <span>Total paid</span>
            <span>{formatCents(order.total)}</span>
          </li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/track" arrow>
          Track my order
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline">
          Back to the shop
        </ButtonLink>
      </div>
    </Container>
  );
}
