"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { type Appearance, loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState, useTransition } from "react";
import { type CheckoutInput, simulatePayment, startCheckout } from "@/app/(site)/checkout/actions";
import { SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, PencilNote } from "@/components/sketch/ornaments";
import { ButtonArrow, PhotoPlaceholder } from "@/components/ui";
import { cartTotal, useCart } from "@/lib/cart";
import type { DeliveryMethod } from "@/lib/db/schema";
import { deliveryZones } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

type Mode = "stripe" | "demo" | "off";

const inputClass =
  "mt-1.5 block w-full border border-line border-b-2 border-b-ink/25 bg-cream/50 px-3 py-2.5 text-ink transition-colors placeholder:text-graphite/50 focus:border-b-brand focus:bg-white focus:outline-none";

// Stripe's card fields render inside a secure frame; this styles them to match the site.
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#b33938",
    colorText: "#24201d",
    colorTextSecondary: "#4e4e4e",
    colorBackground: "#fbf9f6",
    colorDanger: "#b33938",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #ddd3c6", borderBottom: "2px solid rgba(36,32,29,0.25)", boxShadow: "none" },
    ".Input:focus": { borderBottomColor: "#b33938", backgroundColor: "#ffffff", boxShadow: "none" },
    ".Label": { fontWeight: "500", color: "#24201d" },
    ".Tab": { border: "1px solid #ddd3c6", boxShadow: "none" },
    ".Tab--selected": { borderColor: "#24201d", boxShadow: "none" },
  },
};

const methodOptions: { value: DeliveryMethod; label: string; text: string }[] = [
  { value: "delivery", label: "Delivery", text: "Our own van, to your door" },
  { value: "delivery_assembly", label: "Delivery + assembly", text: "We bring it in and set it up" },
  { value: "collection", label: "Collect", text: "Free, from our Athlone workshop" },
];

const servedZones = deliveryZones.filter((z) => z.delivery !== null && z.delivery > 0);

export function CheckoutForm({ mode, publishableKey, initialError }: { mode: Mode; publishableKey: string; initialError?: string }) {
  const cart = useCart();
  const [method, setMethod] = useState<DeliveryMethod>("delivery");
  const [zone, setZone] = useState<string>(servedZones[0]?.name ?? "");
  const [error, setError] = useState(initialError ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<{ orderId: string; total: number; clientSecret?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const zoneInfo = deliveryZones.find((z) => z.name === zone);
  const fee =
    method === "collection" ? 0 : (zoneInfo?.delivery ?? 0) + (method === "delivery_assembly" ? (zoneInfo?.assembly ?? 0) : 0);
  const subtotal = cartTotal(cart);

  if (mode === "off") {
    return (
      <Panel>
        <SketchIcon name="phone" size={56} />
        <h2 className="mt-3 font-serif text-2xl font-semibold">Online payment opens soon</h2>
        <p className="mt-2 text-graphite">
          For now, call us on <a href={site.phoneHref} className="font-semibold text-brand">{site.phone}</a> and
          we&apos;ll take your order over the phone.
        </p>
      </Panel>
    );
  }

  if (cart.length === 0 && !payment) {
    return (
      <Panel>
        <SketchIcon name="cart" size={56} />
        <p className="mt-3 text-graphite">Your cart is empty.</p>
        <Link href="/shop" className="btn btn--primary mt-5">Browse the shop</Link>
      </Panel>
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input: CheckoutInput = {
      cart: cart.map((i) => ({ slug: i.slug, options: i.options, quantity: i.quantity })),
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      deliveryMethod: method,
      deliveryZone: zone,
      address: String(f.get("address") ?? ""),
      town: String(f.get("town") ?? ""),
      eircode: String(f.get("eircode") ?? ""),
      notes: String(f.get("notes") ?? ""),
      acceptTerms: f.get("acceptTerms") === "on",
    };
    setError("");
    setFieldErrors({});
    startTransition(async () => {
      const result = await startCheckout(input);
      if (!result.ok) {
        setError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setPayment(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const summary = (
    <aside className="relative h-fit border border-line bg-white p-5 lg:sticky lg:top-32">
      <CornerMarks />
      <h2 className="font-serif text-xl font-semibold">Your order</h2>
      <ul className="mt-4 divide-y divide-line">
        {cart.map((item) => (
          <li key={item.key} className="flex gap-3 py-3 text-sm">
            <PhotoPlaceholder className="h-12 w-12 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{item.quantity} × {item.name}</p>
              {Object.keys(item.options).length > 0 && (
                <p className="text-graphite">{Object.values(item.options).join(" · ")}</p>
              )}
            </div>
            <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
        <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-graphite">{method === "collection" ? "Collection" : method === "delivery_assembly" ? "Delivery + assembly" : "Delivery"}</dt>
          <dd>{fee === 0 ? "Free" : formatPrice(fee)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold">
          <dt>Total</dt>
          <dd>{payment ? formatPrice(payment.total / 100) : formatPrice(subtotal + fee)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-graphite">All prices include VAT.</p>
    </aside>
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <Steps current={payment ? 1 : 0} />
        {error && (
          <p role="alert" className="mb-6 border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{error}</p>
        )}

        {!payment ? (
          <form onSubmit={onSubmit} className="space-y-8">
            <Panel title="Your details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" error={fieldErrors.name}>
                  <input name="name" required autoComplete="name" className={inputClass} />
                </Field>
                <Field label="Phone" error={fieldErrors.phone}>
                  <input name="phone" type="tel" required autoComplete="tel" className={inputClass} />
                </Field>
                <Field label="Email" error={fieldErrors.email} hint="We send your order number and password here." className="sm:col-span-2">
                  <input name="email" type="email" required autoComplete="email" className={inputClass} />
                </Field>
              </div>
            </Panel>

            <Panel title="Delivery">
              <div role="radiogroup" aria-label="Delivery method" className="grid gap-3 sm:grid-cols-3">
                {methodOptions.map((m) => (
                  <label
                    key={m.value}
                    className={`relative cursor-pointer border p-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
                      method === m.value ? "border-brand bg-brand/5" : "border-line hover:border-ink/40"
                    }`}
                  >
                    <input type="radio" name="deliveryMethod" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="sr-only" />
                    <SketchIcon name={m.value === "collection" ? "pin" : m.value === "delivery" ? "van" : "hammer"} size={36} />
                    <span className="mt-2 block font-semibold text-ink">{m.label}</span>
                    <span className="block text-graphite">{m.text}</span>
                    {method === m.value && <SketchIcon name="tick" size={20} className="absolute top-2 right-2" />}
                  </label>
                ))}
              </div>
              <FieldError message={fieldErrors.deliveryMethod} />

              {method !== "collection" ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Delivery area" className="sm:col-span-2">
                    <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputClass}>
                      {servedZones.map((z) => (
                        <option key={z.name} value={z.name}>
                          {z.area}: {formatPrice(z.delivery!)}{method === "delivery_assembly" && z.assembly ? ` + ${formatPrice(z.assembly)} assembly` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Address" error={fieldErrors.address} className="sm:col-span-2">
                    <input name="address" required autoComplete="street-address" className={inputClass} />
                  </Field>
                  <Field label="Town" error={fieldErrors.town}>
                    <input name="town" required autoComplete="address-level2" className={inputClass} />
                  </Field>
                  <Field label="Eircode" error={fieldErrors.eircode}>
                    <input name="eircode" autoComplete="postal-code" className={`${inputClass} uppercase`} placeholder="N37 XXXX" />
                  </Field>
                </div>
              ) : (
                <p className="mt-5 flex items-center gap-3 bg-cream p-4 text-sm text-graphite">
                  <SketchIcon name="clock" size={32} />
                  We&apos;ll let you know when it&apos;s ready to collect from our workshop in {site.address.locality}.
                </p>
              )}
              <Field label="Notes for us (optional)" className="mt-5">
                <textarea name="notes" rows={2} className={inputClass} placeholder="e.g. access, parking, best time to deliver" />
              </Field>
            </Panel>

            <label className="flex gap-3 text-sm text-graphite">
              <input type="checkbox" name="acceptTerms" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
              <span>
                I accept the <Link href="/legal/terms" className="underline">terms</Link> and{" "}
                <Link href="/legal/returns" className="underline">returns policy</Link>. Made-to-order pieces are built for me and can&apos;t be returned unless faulty.
              </span>
            </label>
            <FieldError message={fieldErrors.acceptTerms} />

            <button type="submit" disabled={pending} className="btn btn--primary w-full !py-4 !text-base disabled:opacity-60 sm:w-auto">
              {pending ? "Preparing payment…" : <>Continue to payment <ButtonArrow /></>}
            </button>
          </form>
        ) : (
          <Panel title="Payment">
            {mode === "stripe" && payment.clientSecret ? (
              <StripePayment publishableKey={publishableKey} clientSecret={payment.clientSecret} orderId={payment.orderId} total={payment.total} />
            ) : (
              <DemoPayment orderId={payment.orderId} total={payment.total} />
            )}
            <button type="button" onClick={() => setPayment(null)} className="mt-6 flex items-center gap-2 text-sm font-semibold text-graphite hover:text-ink">
              <SketchIcon name="arrow" size={20} className="rotate-180" /> Change details
            </button>
          </Panel>
        )}
      </div>
      {summary}
    </div>
  );
}

function StripePayment({ publishableKey, clientSecret, orderId, total }: { publishableKey: string; clientSecret: string; orderId: string; total: number }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance, fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" }] }}
    >
      <StripePayButton orderId={orderId} total={total} />
    </Elements>
  );
}

function StripePayButton({ orderId, total }: { orderId: string; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true);
    setMessage("");
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order/finish?order=${orderId}` },
    });
    // Only reached if the payment failed or was cancelled; success redirects away.
    setMessage(error?.message ?? "The payment didn't go through. Please try again.");
    setBusy(false);
  }

  return (
    <div>
      <PaymentElement options={{ layout: "tabs" }} />
      {message && <p role="alert" className="mt-4 text-sm font-medium text-brand">{message}</p>}
      <button type="button" onClick={pay} disabled={!stripe || busy} className="btn btn--primary mt-6 w-full !py-4 !text-base disabled:opacity-60">
        {busy ? "Processing…" : <>Pay {formatPrice(total / 100)} <ButtonArrow /></>}
      </button>
      <p className="mt-3 flex items-center gap-2 text-xs text-graphite">
        <SketchIcon name="shield" size={20} /> Card details go straight to Stripe over an encrypted connection. We never see or store them.
      </p>
    </div>
  );
}

function DemoPayment({ orderId, total }: { orderId: string; total: number }) {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <div className="border-2 border-dashed border-brand/50 bg-brand/5 p-4 text-sm">
        <PencilNote className="block text-brand">test mode</PencilNote>
        Card payments aren&apos;t connected yet (no Stripe keys), so this button simulates a successful payment.
        It only works on development and preview sites, never on the live shop.
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await simulatePayment(orderId);
          // /order/finish is a route handler that sets cookies and redirects, so do a full navigation.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/order/finish?order=${orderId}`;
        }}
        className="btn btn--primary mt-6 w-full !py-4 !text-base disabled:opacity-60"
      >
        {busy ? "Processing…" : <>Simulate paying {formatPrice(total / 100)} <ButtonArrow /></>}
      </button>
    </div>
  );
}

function Steps({ current }: { current: number }) {
  return (
    <ol className="mb-8 grid grid-cols-3 gap-2 text-sm">
      {["Details", "Payment", "Track your order"].map((label, i) => (
        <li key={label} className="flex flex-col gap-2">
          <span className={`font-medium ${i <= current ? "text-ink" : "text-graphite"}`}>
            <span className="font-hand mr-1.5 text-lg text-brand">{i + 1}</span>
            {label}
          </span>
          <span aria-hidden className="h-0.5 bg-line">
            <span className={`block h-full bg-brand transition-[width] duration-500 ${i <= current ? "w-full" : "w-0"}`} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="relative border border-line bg-white p-5 sm:p-7">
      {title && <h2 className="mb-5 font-serif text-2xl font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

function Field({ label, error, hint, className = "", children }: { label: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-graphite">{hint}</span>}
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm font-medium text-brand">{message}</span>;
}
