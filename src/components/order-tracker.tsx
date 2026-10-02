import { SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, PencilNote, SketchCircle } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import type { Order, OrderEvent } from "@/lib/orders";
import { currentStepIndex, deliveryLabels, formatCents, formatDate, paymentSummary, statusLabels, trackingSteps } from "@/lib/order-status";
import { site } from "@/lib/site";

export function OrderTracker({ order, events }: { order: Order; events: OrderEvent[] }) {
  const steps = trackingSteps(order.deliveryMethod);
  const current = currentStepIndex(order.deliveryMethod, order.status);
  const cancelled = order.status === "cancelled";
  const eta = formatDate(order.etaDate);
  const done = order.status === "delivered" || order.status === "collected";
  const payment = paymentSummary(order.paymentRef);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-8">
        <Reveal className="relative border border-line bg-white p-6 sm:p-8">
          <CornerMarks />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-graphite">Order {order.code}</p>
              <h2 className="mt-1 font-serif text-3xl font-semibold">{statusLabels[order.status]}</h2>
            </div>
            {eta && !done && !cancelled && (
              <div className="text-right">
                <p className="text-sm text-graphite">{order.deliveryMethod === "collection" ? "Ready by" : "Expected"}</p>
                <p className="mt-1 text-lg font-semibold">
                  <SketchCircle>{eta}</SketchCircle>
                </p>
              </div>
            )}
          </div>
          {order.statusNote && (
            <p className="mt-5 border-l-4 border-oak bg-cream p-4 text-graphite">
              <PencilNote className="mb-1 block text-xl text-ink">from the workshop</PencilNote>
              {order.statusNote}
            </p>
          )}

          {cancelled ? (
            <p className="mt-8 text-graphite">This order was cancelled. If you have questions, call us on {site.phone}.</p>
          ) : (
            <ol className="relative mt-10 grid grid-cols-4 gap-2">
              <span aria-hidden className="absolute top-7 right-[12.5%] left-[12.5%] h-0.5 bg-line" />
              <span
                aria-hidden
                className="absolute top-7 left-[12.5%] h-0.5 bg-brand transition-[width] duration-700"
                style={{ width: `${(Math.max(current, 0) / (steps.length - 1)) * 75}%` }}
              />
              {steps.map((step, i) => {
                const state = i < current ? "done" : i === current ? "now" : "next";
                return (
                  <li key={step.label} aria-current={state === "now" ? "step" : undefined} className="relative flex flex-col items-center text-center">
                    <span
                      className={`relative z-10 grid h-14 w-14 place-items-center border-2 bg-white transition-colors ${
                        state === "next" ? "border-line opacity-50" : state === "now" ? "border-brand" : "border-ink"
                      }`}
                    >
                      <SketchIcon name={state === "done" ? "tick" : step.icon} size={34} />
                    </span>
                    <span className={`mt-3 text-xs font-semibold sm:text-sm ${state === "next" ? "text-graphite" : "text-ink"}`}>{step.label}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </Reveal>

        <section className="border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold">History</h2>
          <ol className="mt-4 space-y-4">
            {[...events].filter((e) => e.status !== "pending_payment").reverse().map((event) => (
              <li key={event.id} className="flex gap-4 text-sm">
                <span className="font-hand w-28 shrink-0 text-lg leading-tight text-graphite">
                  {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(event.createdAt))}
                </span>
                <span>
                  <span className="font-semibold">{statusLabels[event.status]}</span>
                  {event.note && <span className="block text-graphite">{event.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="relative border border-line bg-white p-5">
          <CornerMarks />
          <h2 className="font-serif text-xl font-semibold">Your order</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 py-2.5">
                <span>
                  {item.quantity} × {item.name}
                  {Object.keys(item.options).length > 0 && <span className="block text-graphite">{Object.values(item.options).join(" · ")}</span>}
                </span>
                <span className="font-medium">{formatCents(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between py-2.5 text-graphite">
              <span>{deliveryLabels[order.deliveryMethod]}</span>
              <span>{order.deliveryFee === 0 ? "Free" : formatCents(order.deliveryFee)}</span>
            </li>
            <li className="flex justify-between pt-3 font-semibold">
              <span>{payment.paid ? "Total paid" : "Order total"}</span>
              <span>{formatCents(order.total)}</span>
            </li>
            <li className={`pt-1 text-xs ${payment.paid ? "text-graphite" : "font-semibold text-brand"}`}>{payment.label}</li>
          </ul>
        </section>
        <section className="border border-line bg-white p-5 text-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <SketchIcon name={order.deliveryMethod === "collection" ? "pin" : "van"} size={28} />
            {order.deliveryMethod === "collection" ? "Collection" : "Delivering to"}
          </h2>
          <p className="mt-2 text-graphite">
            {order.deliveryMethod === "collection"
              ? `Our workshop, ${site.address.locality}. We'll text you when it's ready.`
              : [order.address, order.town, order.eircode].filter(Boolean).join(", ")}
          </p>
        </section>
        <section className="border border-line bg-white p-5 text-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <SketchIcon name="chat" size={28} /> Questions?
          </h2>
          <p className="mt-2 text-graphite">
            Call <a href={site.phoneHref} className="font-semibold text-brand">{site.phone}</a> or{" "}
            <a href={site.whatsappHref} className="font-semibold text-brand">WhatsApp us</a> with your order number.
          </p>
        </section>
      </aside>
    </div>
  );
}
