"use client";

import { type ReactNode, startTransition, useActionState, useState } from "react";
import { type ContentFormState, saveSiteContent } from "@/app/orc-admin-internal/content/actions";
import { adminInput } from "@/components/admin/forms";
import { SketchIcon } from "@/components/sketch/icons";
import type { DeliveryZone, SiteContent } from "@/lib/content-defaults";


export function ContentEditor({
  content,
  services,
}: {
  content: SiteContent;
  services: { slug: string; name: string; fromPrice: string }[];
}) {
  const [state, action, pending] = useActionState<ContentFormState, FormData>(saveSiteContent, {});
  // Each row keeps a stable key so removing one doesn't shift the others' typed values.
  const [zones, setZones] = useState<(DeliveryZone & { key: number })[]>(() => content.deliveryZones.map((z, i) => ({ ...z, key: i })));
  const errors = state.fieldErrors ?? {};
  const { contact, home } = content;

  return (
    <form
      onSubmit={(e) => {
        // Submit by hand so the fields keep what was typed (a form action would reset them).
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]"
    >
      <input type="hidden" name="zoneCount" value={zones.length} />
      <div className="space-y-6">
        {state.error && <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>}

        <Box title="Contact details" hint="Header, footer, Contact and About pages, order emails.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone}>
              <input name="phone" defaultValue={contact.phone} className={adminInput} />
            </Field>
            <Field label="WhatsApp number" error={errors.whatsapp} hint="With country code, no 0 or +: 353894928771">
              <input name="whatsapp" defaultValue={contact.whatsapp} inputMode="numeric" className={adminInput} />
            </Field>
          </div>
          <Field label="Email" error={errors.email}>
            <input name="email" type="email" defaultValue={contact.email} className={adminInput} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Street">
              <input name="street" defaultValue={contact.street} className={adminInput} />
            </Field>
            <Field label="Town" error={errors.locality}>
              <input name="locality" defaultValue={contact.locality} className={adminInput} />
            </Field>
            <Field label="County">
              <input name="county" defaultValue={contact.county} className={adminInput} />
            </Field>
          </div>
          <Field label="Workshop hours">
            <input name="hours" defaultValue={contact.hours} className={adminInput} />
          </Field>
          <Field label="Google Maps link" error={errors.mapsHref} hint="Google Maps → Share → Copy link.">
            <input name="mapsHref" defaultValue={contact.mapsHref} className={`${adminInput} text-sm`} />
          </Field>
          <Field label="Facebook page" error={errors.facebook} hint="Facebook → your page → Share → Copy link. Empty = no Facebook link on the site.">
            <input name="facebook" defaultValue={contact.facebook} className={`${adminInput} text-sm`} />
          </Field>
        </Box>

        <Box title="Home page" hint="The first thing visitors read.">
          <Field label="Small line above the headline">
            <input name="eyebrow" defaultValue={home.eyebrow} className={adminInput} />
          </Field>
          <Field label="Headline" error={errors.headline} hint="Put *stars* around the words to underline in pencil, e.g. Joinery made *by hand.*">
            <input name="headline" defaultValue={home.headline} className={adminInput} />
          </Field>
          <Field label="Text under the headline">
            <textarea name="intro" rows={3} defaultValue={home.intro} className={adminInput} />
          </Field>
        </Box>

        <Box title="Delivery zones" hint="Shown on the Delivery page and used at checkout. Leave a price empty for “on request” (delivery) or “not offered” (assembly).">
          {errors.zones && <p className="text-sm text-brand">{errors.zones}</p>}
          <div className="space-y-3">
            {zones.map((z, i) => (
              <div key={z.key} className="grid gap-2 border border-line bg-cream/50 p-3 sm:grid-cols-[1fr_1.6fr_90px_90px_auto] sm:items-end">
                <Field label="Zone">
                  <input name={`zone${i}name`} value={z.name} onChange={(e) => setZones((l) => l.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} className={adminInput} />
                </Field>
                <Field label="Area">
                  <input name={`zone${i}area`} defaultValue={z.area} className={adminInput} />
                </Field>
                <Field label="Delivery €" error={errors[`zone${i}delivery`]}>
                  <input name={`zone${i}delivery`} defaultValue={z.delivery ?? ""} inputMode="decimal" className={adminInput} />
                </Field>
                <Field label="Assembly €" error={errors[`zone${i}assembly`]}>
                  <input name={`zone${i}assembly`} defaultValue={z.assembly ?? ""} inputMode="decimal" className={adminInput} />
                </Field>
                <button type="button" onClick={() => setZones((l) => l.filter((_, k) => k !== i))} className="pb-3 text-xs font-semibold text-brand">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setZones((l) => [...l, { name: "", area: "", delivery: null, assembly: null, key: Date.now() }])} className="btn btn--outline !py-2" disabled={zones.length >= 12}>
            + Add a zone
          </button>
          <p className="text-xs text-graphite">A zone with delivery €0 is collection. Customers can choose a zone at checkout when its delivery price is above €0.</p>
        </Box>

        <Box title="Service prices" hint="The “from” price on each service page. Empty = no price shown.">
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <Field key={s.slug} label={s.name}>
                <input name={`price_${s.slug}`} defaultValue={s.fromPrice} placeholder="e.g. from €1,800" className={adminInput} />
              </Field>
            ))}
          </div>
        </Box>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Box title="Prices & promises">
          <Field label="Home survey fee (€)" error={errors.surveyFee} hint="Taken off the order if the customer goes ahead.">
            <input name="surveyFee" defaultValue={content.surveyFee} inputMode="decimal" className={adminInput} />
          </Field>
          <Field label="Quote reply time (hours)" error={errors.quoteResponseHours} hint="“We'll reply within … hours”.">
            <input name="quoteResponseHours" type="number" min={1} max={240} defaultValue={content.quoteResponseHours} className={adminInput} />
          </Field>
        </Box>
        {state.saved && !pending && (
          <p role="status" className="flex items-center gap-2 text-sm font-medium"><SketchIcon name="tick" size={20} /> Saved. The site is updated.</p>
        )}
        <button type="submit" disabled={pending} className="btn btn--primary w-full disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Box({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border border-line bg-white p-5">
      <div>
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
        {hint && <p className="text-xs text-graphite">{hint}</p>}
      </div>
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
