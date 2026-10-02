"use client";

import Image from "next/image";
import { type ReactNode, startTransition, useActionState, useState } from "react";
import { type ProductFormState, saveProduct, uploadProductImage } from "@/app/orc-admin-internal/products/actions";
import { adminInput } from "@/components/admin/forms";
import { SketchIcon } from "@/components/sketch/icons";
import { type Product, type ProductImage, type ProductMode, categories, modeLabels } from "@/lib/catalog";
import { shrinkImage } from "@/lib/shrink-image";
import { slugify } from "@/lib/slug";

const modeHelp: Record<ProductMode, string> = {
  in_stock: "Finished piece on the shelf. Customers pay online; stock goes down with each order.",
  made_to_order: "Built after the order. Customers pay online; show the lead time.",
  quote_only: "No fixed price. The page shows “from” the price and a quote button.",
};

export function ProductEditor({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [mode, setMode] = useState<ProductMode>(product?.mode ?? "made_to_order");
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const errors = state.fieldErrors ?? {};

  async function addPhotos(files: FileList | null) {
    setUploadError("");
    for (const original of Array.from(files ?? []).slice(0, 12 - images.length)) {
      setUploading((n) => n + 1);
      try {
        const file = await shrinkImage(original, 2000, 0.85);
        const data = new FormData();
        data.set("file", file);
        data.set("name", name);
        const result = await uploadProductImage(data);
        if (result.url) setImages((list) => [...list, { url: result.url! }]);
        else setUploadError(result.error ?? "Upload failed.");
      } catch {
        setUploadError("Upload failed. The photo may be too large.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function move(i: number, d: -1 | 1) {
    setImages((list) => {
      const next = [...list];
      const j = i + d;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

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
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="space-y-6">
        {state.error && <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>}

        <Box title="Product">
          <Field label="Name" error={errors.name}>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              className={adminInput}
            />
          </Field>
          <Field label="Web address" error={errors.slug} hint={`oldredchisel.ie/shop/${slug || "…"}`}>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugEdited(true);
              }}
              className={`${adminInput} font-mono text-sm`}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category}>
              <select name="category" defaultValue={product?.category ?? categories[0].slug} className={adminInput}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="How it's sold" error={errors.mode}>
              <select name="mode" value={mode} onChange={(e) => setMode(e.target.value as ProductMode)} className={adminInput}>
                {(Object.keys(modeLabels) as ProductMode[]).map((m) => (
                  <option key={m} value={m}>{m === "quote_only" ? "Quote only" : modeLabels[m]}</option>
                ))}
              </select>
            </Field>
          </div>
          <p className="text-xs text-graphite">{modeHelp[mode]}</p>
          <Field label="Short summary" hint="One line, shown under the name.">
            <input name="summary" defaultValue={product?.summary} maxLength={300} className={adminInput} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={5} defaultValue={product?.description} className={adminInput} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Dimensions">
              <input name="dimensions" defaultValue={product?.dimensions} placeholder="W 45 × D 38 × H 55 cm" className={adminInput} />
            </Field>
            <Field label="Material">
              <input name="material" defaultValue={product?.material} placeholder="Solid oak, oil finish" className={adminInput} />
            </Field>
            <Field label="Lead time">
              <input name="leadTime" defaultValue={product?.leadTime} placeholder="Made to order in 3–4 weeks" className={adminInput} />
            </Field>
          </div>
        </Box>

        <Box title="Photos">
          <p className="text-xs text-graphite">The first photo is the main one. Photos are resized automatically before upload.</p>
          {images.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <li key={img.url} className="border border-line bg-cream p-1.5">
                  <div className="relative aspect-square">
                    <Image src={img.url} alt="" fill sizes="160px" className="object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 bg-ink px-1.5 text-[10px] font-semibold text-white uppercase">Main</span>}
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1 disabled:opacity-30" aria-label="Move earlier">←</button>
                    <button type="button" onClick={() => setImages((l) => l.filter((_, k) => k !== i))} className="font-semibold text-brand">Remove</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="px-1 disabled:opacity-30" aria-label="Move later">→</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <label className="flex cursor-pointer items-center gap-4 border-2 border-dashed border-line bg-cream/50 p-4 text-sm hover:border-brand">
            <SketchIcon name="camera" size={40} />
            <span>
              <span className="block font-semibold">{uploading ? `Uploading ${uploading}…` : "Add photos"}</span>
              <span className="text-graphite">JPG, PNG or WebP, up to 12 photos</span>
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
          </label>
          {uploadError && <p className="text-sm font-medium text-brand">{uploadError}</p>}
        </Box>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Box title="Price & stock">
          <Field label={mode === "quote_only" ? "Typical price from (€)" : "Price (€, incl. VAT)"} error={errors.price}>
            <input name="price" inputMode="decimal" required defaultValue={product?.price} className={adminInput} />
          </Field>
          {mode === "in_stock" && (
            <Field label="In stock" error={errors.stock}>
              <input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 1} className={adminInput} />
            </Field>
          )}
        </Box>

        {mode !== "quote_only" && (
          <Box title="Promotion">
            <Field label="Offer price (€)" error={errors.salePrice} hint="Leave empty for no promotion.">
              <input name="salePrice" inputMode="decimal" defaultValue={product?.salePrice ?? ""} className={adminInput} />
            </Field>
            <Field label="Offer ends" error={errors.saleEndsAt} hint="Last day of the offer. Empty = until you remove it.">
              <input name="saleEndsAt" type="date" defaultValue={product?.saleEndsAt ?? ""} className={adminInput} />
            </Field>
          </Box>
        )}

        <Box title="Visibility">
          <Check name="featured" defaultChecked={product?.featured} label="Feature on the home page" />
          <Check name="hidden" defaultChecked={product?.hidden} label="Hide from the shop" hint="Keeps the product but takes it off the site." />
        </Box>

        {product?.options && product.options.length > 0 && (
          <Box title="Options">
            <ul className="space-y-1 text-sm text-graphite">
              {product.options.map((o) => (
                <li key={o.name}><b className="text-ink">{o.name}:</b> {o.choices.map((c) => c.label).join(", ")}</li>
              ))}
            </ul>
          </Box>
        )}

        {state.saved && !pending && (
          <p role="status" className="flex items-center gap-2 text-sm font-medium"><SketchIcon name="tick" size={20} /> Saved. The shop is updated.</p>
        )}
        <button type="submit" disabled={pending || uploading > 0} className="btn btn--primary w-full disabled:opacity-60">
          {pending ? "Saving…" : uploading > 0 ? "Waiting for photos…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
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

function Check({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-brand" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-graphite">{hint}</span>}
      </span>
    </label>
  );
}
