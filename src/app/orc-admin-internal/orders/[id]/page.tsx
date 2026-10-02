import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StatusForm } from "@/components/admin/forms";
import { CustomerAccess } from "@/components/admin/manual-order-form";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { getOrder, getOrderEvents } from "@/lib/orders";
import { deliveryLabels, formatCents, paymentSummary, statusLabels } from "@/lib/order-status";

export default async function AdminOrderPage({ params }: PageProps<"/orc-admin-internal/orders/[id]">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { id } = await params;
  const order = /^[0-9a-f-]{36}$/i.test(id) ? await getOrder(id) : null;
  if (!order) notFound();
  const events = await getOrderEvents(order.id);

  return (
    <>
      <Link href={`${base}/orders`} className="text-sm font-semibold text-graphite hover:text-ink">← All orders</Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-mono text-3xl font-semibold">{order.code}</h1>
        <p className="text-lg font-semibold">{formatCents(order.total)}</p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Section title="Items">
            <ul className="divide-y divide-line text-sm">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium">{item.quantity} × {item.name}</span>
                    {Object.keys(item.options).length > 0 && (
                      <span className="block text-graphite">{Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span>
                    )}
                  </span>
                  <span>{formatCents(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between py-2 text-graphite">
                <span>{deliveryLabels[order.deliveryMethod]}{order.deliveryZone && ` (${order.deliveryZone})`}</span>
                <span>{formatCents(order.deliveryFee)}</span>
              </li>
            </ul>
          </Section>
          <Section title="Customer">
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-graphite">Name</dt><dd>{order.customerName}</dd>
              <dt className="text-graphite">Phone</dt><dd><a href={`tel:${order.phone}`} className="text-brand underline">{order.phone}</a></dd>
              <dt className="text-graphite">Email</dt><dd><a href={`mailto:${order.email}`} className="text-brand underline">{order.email}</a></dd>
              {order.deliveryMethod !== "collection" && (
                <>
                  <dt className="text-graphite">Address</dt>
                  <dd>{[order.address, order.town, order.eircode].filter(Boolean).join(", ")}</dd>
                </>
              )}
              {order.notes && (<><dt className="text-graphite">Notes</dt><dd>{order.notes}</dd></>)}
              <dt className="text-graphite">Payment</dt>
              <dd>
                {paymentSummary(order.paymentRef).label}
                {order.paymentRef && !order.paymentRef.startsWith("manual:") && <span className="block font-mono text-xs text-graphite">{order.paymentRef}</span>}
              </dd>
            </dl>
          </Section>
          <Section title="History">
            <ol className="space-y-2 text-sm">
              {[...events].reverse().map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-32 shrink-0 text-graphite">
                    {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(e.createdAt)}
                  </span>
                  <span><b>{statusLabels[e.status]}</b>{e.note && <span className="block text-graphite">{e.note}</span>}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
        <div className="space-y-6">
        <Section title="Update">
          <StatusForm version={order.updatedAt.toISOString()} orderId={order.id} status={order.status} etaDate={order.etaDate} note={order.statusNote} />
        </Section>
        <Section title="Customer access">
          <p className="text-sm text-graphite">What the customer uses at /track.</p>
          <CustomerAccess orderId={order.id} code={order.code} />
        </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5">
      <h2 className="mb-3 font-serif text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
