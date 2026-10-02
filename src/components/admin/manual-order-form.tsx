"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, startTransition, useActionState, useState } from "react";
import { type ManualOrderState, createManualOrderAction, resetOrderPasswordAction } from "@/app/orc-admin-internal/orders/actions";
import { adminInput } from "@/components/admin/forms";
import { CopyButton } from "@/components/copy-button";
import { SketchIcon } from "@/components/sketch/icons";
import type { DeliveryMethod, OrderStatus } from "@/lib/db/schema";
import { deliveryLabels, manualPayments, statusLabels } from "@/lib/order-status";

export type ProductChoice = { slug: string; name: string; price: number };

type Line = { key: number; slug: string; name: string; details: string; price: string; quantity: number };

const statuses: OrderStatus[] = ["paid", "in_production", "ready", "out_for_delivery", "ready_for_collection", "delivered", "collected"];
let nextKey = 1;
const emptyLine = (): Line => ({ key: nextKey++, slug: "custom", name: "", details: "", price: "", quantity: 1 });
const euro = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
const num = (v: string) => Number(v.replace(",", ".").replace(/[€\s]/g, "")) || 0;

export function ManualOrderForm({ products, base }: { products: ProductChoice[]; base: string }) {
  const [state, action, pending] = useActionState<ManualOrderState, FormData>(createManualOrderAction, {});
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [method, setMethod] = useState<DeliveryMethod>("collection");
  const [fee, setFee] = useState("");
  const errors = state.fieldErrors ?? {};

  if (state.created) return <CreatedCard created={state.created} base={base} />;

  const total = lines.reduce((s, l) => s + num(l.price) * (l.quantity || 0), 0) + (method === "collection" ? 0 : num(fee));
  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("items", JSON.stringify(lines));
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        {state.error && <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>}

        <Box title="Customer">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name}><input name="name" required className={adminInput} /></Field>
            <Field label="Phone"><input name="phone" type="tel" className={adminInput} /></Field>
            <Field label="Email" error={errors.email} hint="Needed to email them the order number and password.">
              <input name="email" type="email" className={adminInput} />
            </Field>
            <Field label="Delivery" error={errors.deliveryMethod}>
              <select name="deliveryMethod" value={method} onChange={(e) => setMethod(e.target.value as DeliveryMethod)} className={adminInput}>
                {(Object.keys(deliveryLabels) as DeliveryMethod[]).map((m) => <option key={m} value={m}>{deliveryLabels[m]}</option>)}
              </select>
            </Field>
          </div>
          {method !== "collection" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Address"><input name="address" className={adminInput} /></Field>
              <Field label="Town"><input name="town" className={adminInput} /></Field>
              <Field label="Eircode" error={errors.eircode}><input name="eircode" className={`${adminInput} uppercase`} /></Field>
            </div>
          )}
          <Field label="Notes (only you see these)"><textarea name="notes" rows={2} className={adminInput} /></Field>
        </Box>

        <Box title="Items">
          {errors.items && <p className="text-sm font-medium text-brand">{errors.items}</p>}
          <ul className="space-y-4">
            {lines.map((l, i) => (
              <li key={l.key} className="grid gap-3 border border-line bg-cream/40 p-3 sm:grid-cols-[1.4fr_1fr_90px_70px_auto] sm:items-end">
                <Field label={`Item ${i + 1}`}>
                  <select
                    value={l.slug}
                    onChange={(e) => {
                      const p = products.find((x) => x.slug === e.target.value);
                      update(l.key, p ? { slug: p.slug, name: p.name, price: String(p.price) } : { slug: "custom", name: "" });
                    }}
                    className={adminInput}
                  >
                    <option value="custom">Custom item / service…</option>
                    {products.map((p) => <option key={p.slug} value={p.slug}>{p.name} ({euro(p.price)})</option>)}
                  </select>
                </Field>
                <Field label="Description">
                  <input value={l.name} onChange={(e) => update(l.key, { name: e.target.value })} placeholder="e.g. Fitted wardrobe, deposit" className={adminInput} />
                </Field>
                <Field label="Price €">
                  <input value={l.price} inputMode="decimal" onChange={(e) => update(l.key, { price: e.target.value })} className={adminInput} />
                </Field>
                <Field label="Qty">
                  <input value={l.quantity} type="number" min={1} onChange={(e) => update(l.key, { quantity: Number(e.target.value) })} className={adminInput} />
                </Field>
                <button
                  type="button"
                  disabled={lines.length === 1}
                  onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                  className="pb-2.5 text-sm font-semibold text-brand disabled:opacity-30"
                >
                  Remove
                </button>
                <div className="sm:col-span-5">
                  <input value={l.details} onChange={(e) => update(l.key, { details: e.target.value })} placeholder="Details shown to the customer (optional): timber, size, finish…" className={`${adminInput} !mt-0 text-sm`} />
                </div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setLines((ls) => [...ls, emptyLine()])} className="btn btn--outline">+ Add item</button>
        </Box>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Box title="Payment & status">
          {method !== "collection" && (
            <Field label="Delivery price €" error={errors.deliveryFee}>
              <input name="deliveryFee" value={fee} onChange={(e) => setFee(e.target.value)} inputMode="decimal" placeholder="0" className={adminInput} />
            </Field>
          )}
          <Field label="Payment" error={errors.payment}>
            <select name="payment" defaultValue="paid_cash" className={adminInput}>
              {Object.entries(manualPayments).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Status" error={errors.status}>
            <select name="status" defaultValue="paid" className={adminInput}>
              {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </select>
          </Field>
          <Field label="Expected date" error={errors.etaDate}><input name="etaDate" type="date" className={adminInput} /></Field>
          <Field label="Note for the customer"><textarea name="statusNote" rows={2} className={adminInput} /></Field>
          <p className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><span>Total</span><span>{euro(total)}</span></p>
        </Box>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="emailCustomer" className="mt-0.5 h-4 w-4 accent-brand" />
          <span>Email the order number and password to the customer</span>
        </label>
        <button type="submit" disabled={pending} className="btn btn--primary w-full disabled:opacity-60">
          {pending ? "Creating…" : "Create order and generate code"}
        </button>
      </div>
    </form>
  );
}

function CreatedCard({ created, base }: { created: NonNullable<ManualOrderState["created"]>; base: string }) {
  return (
    <div className="mx-auto max-w-xl border-2 border-ink bg-white p-6 sm:p-8">
      <SketchIcon name="houseCheck" size={56} />
      <h2 className="mt-3 font-serif text-2xl font-semibold">Order created</h2>
      <p className="mt-1 text-sm text-graphite">
        Give the customer these details. They sign in at <b>oldredchisel.ie/track</b>.{" "}
        {created.emailed ? "We've also emailed them." : created.emailFailed ? "The email wasn&apos;t sent (email isn&apos;t set up yet), so pass them on yourself." : ""}
      </p>
      <Credentials code={created.code} password={created.password} />
      <p className="mt-4 text-xs text-graphite">The password is shown only now. If it&apos;s lost, open the order and make a new one.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`${base}/orders/${created.id}`} className="btn btn--dark">Open the order</Link>
        <a href={`${base}/orders/new`} className="btn btn--outline">Add another</a>
      </div>
    </div>
  );
}

function Credentials({ code, password }: { code: string; password?: string }) {
  return (
    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
      <div>
        <dt className="text-sm text-graphite">Order number</dt>
        <dd className="mt-1 flex items-center justify-between gap-2 border-b-2 border-dashed border-line pb-1.5">
          <span className="font-mono text-xl font-semibold">{code}</span>
          <CopyButton text={code} label="order number" />
        </dd>
      </div>
      {password && (
        <div>
          <dt className="text-sm text-graphite">Password</dt>
          <dd className="mt-1 flex items-center justify-between gap-2 border-b-2 border-dashed border-line pb-1.5">
            <span className="font-mono text-xl font-semibold">{password}</span>
            <CopyButton text={password} label="password" />
          </dd>
        </div>
      )}
    </dl>
  );
}

/** On an order page: shows the order number and lets the admin make a new password. */
export function CustomerAccess({ orderId, code }: { orderId: string; code: string }) {
  const [password, setPassword] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <div>
      <Credentials code={code} password={password} />
      {password ? (
        <p className="mt-3 text-xs text-graphite">New password made. The old one no longer works. It&apos;s shown only now.</p>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!confirming) return setConfirming(true);
            setBusy(true);
            const r = await resetOrderPasswordAction(orderId);
            setPassword(r.password);
            setBusy(false);
          }}
          className="btn btn--outline mt-4 disabled:opacity-60"
        >
          {busy ? "Generating…" : confirming ? "Sure? Their current password stops working" : "Generate new password"}
        </button>
      )}
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border border-line bg-white p-5">
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-graphite">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-brand">{error}</span>}
    </label>
  );
}
