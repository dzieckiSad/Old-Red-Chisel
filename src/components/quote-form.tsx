"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useActionState, useRef, useState, startTransition } from "react";
import { submitQuote } from "@/app/quote/actions";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, type QuoteState, budgets, projectTypes, timings } from "@/lib/quote";
import { SketchIcon } from "@/components/sketch/icons";
import { CornerMarks } from "@/components/sketch/ornaments";
import { ButtonArrow } from "@/components/ui";
import { site } from "@/lib/site";

const steps = ["Your project", "Details", "Contact"] as const;

const inputClass =
  "mt-1.5 block w-full border border-line border-b-2 border-b-ink/25 bg-cream/50 px-3 py-2.5 text-ink transition-colors placeholder:text-graphite/50 focus:border-b-brand focus:bg-white focus:outline-none";

// Phone photos are often 3–8 MB; shrink them in the browser so several fit in one request.
async function shrinkImage(file: File, maxSide = 1600): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC the browser can't decode: send as-is
  }
}

// Which step each field lives on, so server-side errors can send the visitor back to it.
const fieldStep: Record<string, number> = { projectType: 0, description: 1, photos: 1, budget: 1, timing: 1 };

export function QuoteForm({
  initialType,
  product,
}: {
  initialType: string;
  product?: { slug: string; name: string };
}) {
  const [state, formAction, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: "idle" });
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [projectType, setProjectType] = useState(initialType);
  const [photoNote, setPhotoNote] = useState("");
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    const errorSteps = Object.keys(errors).map((k) => fieldStep[k] ?? 2);
    if (errorSteps.length > 0) setStep(Math.min(...errorSteps));
  }

  if (state.status === "success") {
    return (
      <div className="relative border border-line bg-white p-8">
        <CornerMarks />
        <SketchIcon name="houseCheck" size={64} />
        <h2 className="mt-4 font-serif text-2xl font-semibold text-ink">
          Thanks{state.name ? `, ${state.name}` : ""}. We&apos;ve got your request.
        </h2>
        <p className="mt-3 text-graphite">
          We&apos;ll come back to you within {site.quoteResponseHours} hours with a price range and next
          steps. If it&apos;s urgent, call us on{" "}
          <a href={site.phoneHref} className="font-semibold text-brand">
            {site.phone}
          </a>
          .
        </p>
        <Link href="/shop" className="btn btn--outline mt-6">
          Browse the shop while you wait
        </Link>
      </div>
    );
  }

  function goNext() {
    const fieldset = stepRefs.current[step];
    const fields = fieldset?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select",
    );
    for (const field of fields ?? []) {
      if (!field.reportValidity()) return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  async function onPhotos(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = Array.from(input.files ?? []).slice(0, MAX_PHOTOS);
    const shrunk = await Promise.all(picked.map((f) => shrinkImage(f)));
    const total = shrunk.reduce((s, f) => s + f.size, 0);
    if (total > MAX_PHOTO_BYTES) {
      input.value = "";
      setPhotoNote("Those photos are too large. Try fewer, or send them on WhatsApp instead.");
      return;
    }
    const dt = new DataTransfer();
    shrunk.forEach((f) => dt.items.add(f));
    input.files = dt.files;
    setPhotoNote(
      shrunk.length === 0
        ? ""
        : `${shrunk.map((f) => f.name).join(", ")}` + (picked.length < (e.target.files?.length ?? 0) ? ` (first ${MAX_PHOTOS} kept)` : ""),
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // Submit manually so the form isn't reset when the server returns validation errors.
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={onSubmit} className="relative border border-line bg-white p-6 sm:p-8">
      <CornerMarks />
      <ol className="mb-10 grid grid-cols-3 gap-2 text-sm">
        {steps.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center font-hand text-xl leading-none transition-colors ${
                  i < step ? "bg-ink text-white" : i === step ? "bg-brand text-white" : "border border-line text-graphite"
                }`}
                style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`hidden font-medium sm:inline ${i <= step ? "text-ink" : "text-graphite"}`}>{label}</span>
            </span>
            <span aria-hidden className="h-0.5 bg-line">
              <span className={`block h-full bg-brand transition-[width] duration-500 ${i <= step ? "w-full" : "w-0"}`} />
            </span>
          </li>
        ))}
      </ol>

      {state.status === "error" && (
        <p role="alert" className="mb-6 border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">
          {state.message}
        </p>
      )}

      {/* Honeypot for bots */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {product && <input type="hidden" name="product" value={product.slug} />}

      <fieldset ref={(el) => { stepRefs.current[0] = el; }} hidden={step !== 0}>
        <legend className="font-serif text-2xl font-semibold text-ink">What are you planning?</legend>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {projectTypes.map((t) => (
            <label
              key={t.value}
              className={`group relative flex cursor-pointer flex-col items-center gap-2 border p-4 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
                projectType === t.value ? "border-brand bg-brand/5 text-ink" : "border-line hover:border-ink/40 hover:bg-cream/60"
              }`}
            >
              <input
                type="radio"
                name="projectType"
                value={t.value}
                required
                checked={projectType === t.value}
                onChange={() => setProjectType(t.value)}
                className="sr-only"
              />
              <SketchIcon name={t.icon} size={48} className="transition-transform duration-300 group-hover:-rotate-3" />
              {t.label}
              {projectType === t.value && (
                <SketchIcon name="tick" size={22} className="absolute top-1.5 right-1.5" />
              )}
            </label>
          ))}
        </div>
        <FieldError message={errors.projectType} />
      </fieldset>

      <fieldset ref={(el) => { stepRefs.current[1] = el; }} hidden={step !== 1} className="space-y-5">
        <legend className="font-serif text-2xl font-semibold text-ink">Tell us about the job</legend>
        {product && (
          <p className="bg-sand px-3 py-2 text-sm">
            Based on: <strong>{product.name}</strong>
          </p>
        )}
        <label className="block text-sm font-medium">
          What would you like done?
          <textarea name="description" required minLength={10} rows={5} className={inputClass}
            placeholder="e.g. Fitted wardrobe across one wall of the main bedroom, sliding doors, sloped ceiling on one side." />
          <FieldError message={errors.description} />
        </label>
        <label className="block text-sm font-medium">
          Rough measurements <span className="font-normal text-graphite">(optional)</span>
          <input name="measurements" className={inputClass} placeholder="e.g. 3.2 m wide, 2.4 m high" />
        </label>
        <div className="text-sm font-medium">
          Photos of the space <span className="font-normal text-graphite">(optional, up to {MAX_PHOTOS})</span>
          <label className="mt-1.5 flex cursor-pointer items-center gap-4 border-2 border-dashed border-line bg-cream/50 p-4 transition-colors hover:border-brand has-[:focus-visible]:border-brand">
            <SketchIcon name="camera" size={44} />
            <span>
              <span className="block font-semibold text-ink">{photoNote ? "Change photos" : "Add photos"}</span>
              <span className="block font-normal text-graphite">{photoNote || "A few phone photos help us price it accurately."}</span>
            </span>
            <input type="file" name="photos" accept="image/*" multiple onChange={onPhotos} className="sr-only" />
          </label>
          <FieldError message={errors.photos} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Budget
            <select name="budget" className={inputClass} defaultValue="">
              <option value="">Choose…</option>
              {budgets.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">
            When
            <select name="timing" className={inputClass} defaultValue="">
              <option value="">Choose…</option>
              {timings.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset ref={(el) => { stepRefs.current[2] = el; }} hidden={step !== 2} className="space-y-5">
        <legend className="font-serif text-2xl font-semibold text-ink">Where can we reach you?</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Name
            <input name="name" required autoComplete="name" className={inputClass} />
            <FieldError message={errors.name} />
          </label>
          <label className="block text-sm font-medium">
            Phone
            <input name="phone" type="tel" required autoComplete="tel" className={inputClass} />
            <FieldError message={errors.phone} />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
            <FieldError message={errors.email} />
          </label>
          <label className="block text-sm font-medium">
            Preferred contact
            <select name="contactPreference" className={inputClass} defaultValue="Phone">
              <option>Phone</option>
              <option>Email</option>
              <option>WhatsApp</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Town or area
            <input name="town" required autoComplete="address-level2" className={inputClass} placeholder="e.g. Athlone" />
            <FieldError message={errors.town} />
          </label>
          <label className="block text-sm font-medium">
            Eircode <span className="font-normal text-graphite">(optional)</span>
            <input name="eircode" autoComplete="postal-code" className={`${inputClass} uppercase`} placeholder="N37 XXXX" />
            <FieldError message={errors.eircode} />
          </label>
        </div>
        <label className="flex gap-3 text-sm text-graphite">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
          <span>
            I agree to Old Red Chisel using these details to reply to my request, as described in the{" "}
            <Link href="/legal/privacy" className="underline">privacy policy</Link>.
          </span>
        </label>
        <FieldError message={errors.consent} />
      </fieldset>

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 px-2 py-3 text-sm font-semibold text-graphite hover:text-ink">
            <SketchIcon name="arrow" size={22} className="rotate-180" />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < steps.length - 1 ? (
          <button type="button" onClick={goNext} className="btn btn--dark">
            Continue <ButtonArrow />
          </button>
        ) : (
          <button type="submit" disabled={pending} className="btn btn--primary disabled:opacity-60">
            {pending ? "Sending…" : <>Send my request <ButtonArrow /></>}
          </button>
        )}
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm font-medium text-brand">{message}</span>;
}
