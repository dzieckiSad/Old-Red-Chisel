"use client";

import { useActionState } from "react";
import { type TrackState, trackLogin } from "@/app/(site)/track/actions";
import { SketchIcon } from "@/components/sketch/icons";
import { CornerMarks } from "@/components/sketch/ornaments";
import { ButtonArrow } from "@/components/ui";

const inputClass =
  "mt-1.5 block w-full border border-line border-b-2 border-b-ink/25 bg-cream/50 px-3 py-3 font-mono text-lg tracking-wider text-ink transition-colors placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:text-graphite/50 focus:border-b-brand focus:bg-white focus:outline-none";

export function TrackLogin() {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackLogin, {});
  return (
    <form action={action} className="relative border border-line bg-white p-6 sm:p-8">
      <CornerMarks />
      <SketchIcon name="van" size={56} />
      <h2 className="mt-3 font-serif text-2xl font-semibold">Find your order</h2>
      <p className="mt-1 text-sm text-graphite">Use the order number and password from your confirmation email.</p>
      {state.error && (
        <p role="alert" className="mt-5 border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>
      )}
      <label className="mt-6 block text-sm font-medium">
        Order number
        <input name="code" required defaultValue={state.code} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="ORC-XXXX-XXXX" className={`${inputClass} uppercase`} />
      </label>
      <label className="mt-5 block text-sm font-medium">
        Password
        <input name="password" type="password" required autoComplete="current-password" spellCheck={false} placeholder="xxxx-xxxx-xxxx" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className="btn btn--primary mt-7 w-full !py-4 !text-base disabled:opacity-60">
        {pending ? "Checking…" : <>Track order <ButtonArrow /></>}
      </button>
    </form>
  );
}
