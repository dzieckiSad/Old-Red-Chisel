"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useActionState, useRef, useState, startTransition } from "react";
import { submitQuote } from "@/app/quote/actions";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, type QuoteState, budgets, projectTypes, timings } from "@/lib/quote";
import { site } from "@/lib/site";

const steps = ["Your project", "Details", "Contact"] as const;

const inputClass =
  "mt-1 block w-full border border-line bg-white px-3 py-2.5 text-ink focus:border-ink focus:outline-none";

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
      <div className="border border-line bg-white p-8">
        <h2 className="font-serif text-2xl font-semibold text-ink">
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
        <Link href="/shop" className="mt-6 inline-block font-semibold text-brand hover:underline">
          Browse the shop while you wait →
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
      `${shrunk.length} photo${shrunk.length === 1 ? "" : "s"} attached` +
        ((input.files?.length ?? 0) < (e.target.files?.length ?? 0) ? ` (max ${MAX_PHOTOS})` : ""),
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // Submit manually so the form isn't reset when the server returns validation errors.
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="border border-line bg-white p-6 sm:p-8">
      <ol className="mb-8 flex gap-2 text-sm">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`flex-1 border-t-4 pt-2 ${i <= step ? "border-brand text-ink" : "border-line text-graphite"}`}
          >
            <span className="font-semibold">{i + 1}.</span> {label}
          </li>
        ))}
      </ol>

      {state.status === "error" && (
        <p role="alert" className="mb-6 bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      {/* Honeypot for bots */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {product && <input type="hidden" name="product" value={product.slug} />}

      <fieldset ref={(el) => { stepRefs.current[0] = el; }} hidden={step !== 0}>
        <legend className="font-serif text-2xl font-semibold text-ink">What are you planning?</legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {projectTypes.map((t) => (
            <label
              key={t.value}
              className={`cursor-pointer border p-4 font-medium ${
                projectType === t.value ? "border-brand bg-brand/5 text-ink" : "border-line hover:border-ink/40"
              }`}
            >
              <input
                type="radio"
                name="projectType"
                value={t.value}
                required
                checked={projectType === t.value}
                onChange={() => setProjectType(t.value)}
                className="mr-2 accent-brand"
              />
              {t.label}
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
        <label className="block text-sm font-medium">
          Photos of the space <span className="font-normal text-graphite">(optional, up to {MAX_PHOTOS})</span>
          <input type="file" name="photos" accept="image/*" multiple onChange={onPhotos}
            className="mt-1 block w-full text-sm file:mr-3 file: file:border-0 file:bg-sand file:px-4 file:py-2 file:font-semibold" />
          <span className="mt-1 block text-xs text-graphite">{photoNote}</span>
          <FieldError message={errors.photos} />
        </label>
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
          <input type="checkbox" name="consent" required className="mt-0.5 accent-brand" />
          <span>
            I agree to Old Red Chisel using these details to reply to my request, as described in the{" "}
            <Link href="/legal/privacy" className="underline">privacy policy</Link>.
          </span>
        </label>
        <FieldError message={errors.consent} />
      </fieldset>

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="px-4 py-3 text-sm font-semibold text-graphite hover:text-ink">
            ← Back
          </button>
        ) : (
          <span />
        )}
        {step < steps.length - 1 ? (
          <button type="button" onClick={goNext} className="btn btn--dark">
            Continue
          </button>
        ) : (
          <button type="submit" disabled={pending} className="btn btn--primary disabled:opacity-60">
            {pending ? "Sending…" : "Send my request"}
          </button>
        )}
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm text-red-700">{message}</span>;
}
