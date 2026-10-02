"use client";

import { useActionState } from "react";
import { ButtonArrow } from "@/components/ui";
import { type UnlockState, unlockSite } from "./actions";

export function UnlockForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlockSite, {});
  return (
    <form action={action} className="mt-6 space-y-4 text-left">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>
      )}
      <label className="block text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 block w-full border border-line border-b-2 border-b-ink/25 bg-cream/50 px-3 py-3 text-ink focus:border-b-brand focus:bg-white focus:outline-none"
        />
      </label>
      <button type="submit" disabled={pending} className="btn btn--primary w-full !py-3.5 disabled:opacity-60">
        {pending ? "Checking…" : <>Enter <ButtonArrow /></>}
      </button>
    </form>
  );
}
