"use client";

import { type FormEvent, startTransition, useActionState } from "react";
import { type FormState, loginAdmin, saveOrderStatus, setupAdmin } from "@/app/orc-admin-internal/actions";
import { SketchIcon } from "@/components/sketch/icons";
import type { OrderStatus } from "@/lib/db/schema";
import { statusLabels } from "@/lib/order-status";

export const adminInput =
  "mt-1.5 block w-full border border-line border-b-2 border-b-ink/25 bg-cream/50 px-3 py-2.5 text-ink focus:border-b-brand focus:bg-white focus:outline-none";

function ErrorNote({ state }: { state: FormState }) {
  if (!state.error) return null;
  return <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>;
}

function Authenticator({ qrSvg, secret, sealedName, sealed }: { qrSvg: string; secret: string; sealedName: string; sealed: string }) {
  return (
    <div className="grid items-center gap-5 border border-line bg-cream/60 p-4 sm:grid-cols-[180px_1fr]">
      <input type="hidden" name={sealedName} value={sealed} />
      <div className="bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      <div className="text-sm">
        <p className="font-semibold">Scan with your authenticator app</p>
        <p className="mt-1 text-graphite">Google Authenticator, Microsoft Authenticator or 1Password. Or type this key:</p>
        <p className="mt-2 font-mono text-xs break-all">{secret}</p>
        <CodeField />
      </div>
    </div>
  );
}

function CodeField() {
  return (
    <label className="mt-4 block text-sm font-medium">
      6-digit code from the app
      <input name="code" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" className={`${adminInput} font-mono text-lg tracking-[0.4em]`} />
    </label>
  );
}

/** Submits without React's automatic form reset, so typed values survive an error. */
function useNoResetSubmit(action: (data: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };
}

export function SetupForm({ twoFactor }: { twoFactor: { sealed: string; qrSvg: string; secret: string } | null }) {
  const [state, action, pending] = useActionState(setupAdmin, {});
  return (
    <form onSubmit={useNoResetSubmit(action)} className="space-y-5">
      <ErrorNote state={state} />
      <label className="block text-sm font-medium">
        Setup key <span className="font-normal text-graphite">(ADMIN_SETUP_KEY from Vercel)</span>
        <input name="setupKey" type="password" required autoComplete="off" className={adminInput} />
      </label>
      <label className="block text-sm font-medium">
        Your email
        <input name="email" type="email" required autoComplete="username" className={adminInput} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          New password <span className="font-normal text-graphite">(12+ characters)</span>
          <input name="password" type="password" required minLength={12} autoComplete="new-password" className={adminInput} />
        </label>
        <label className="block text-sm font-medium">
          Repeat password
          <input name="password2" type="password" required minLength={12} autoComplete="new-password" className={adminInput} />
        </label>
      </div>
      {twoFactor && <Authenticator {...twoFactor} sealedName="totpSealed" />}
      <button type="submit" disabled={pending} className="btn btn--primary w-full disabled:opacity-60">
        {pending ? "Saving…" : "Create admin account"}
      </button>
    </form>
  );
}

export function LoginForm({ twoFactor }: { twoFactor: boolean }) {
  const [state, action, pending] = useActionState(loginAdmin, {});
  return (
    <form onSubmit={useNoResetSubmit(action)} className="space-y-5">
      <ErrorNote state={state} />
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="username" className={adminInput} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={adminInput} />
      </label>
      {state.enroll ? (
        <>
          <p className="text-sm text-graphite">Two-step sign-in is now on. Add this account to your authenticator app once:</p>
          <Authenticator {...state.enroll} sealedName="enrollSealed" />
        </>
      ) : (
        twoFactor && <CodeField />
      )}
      <button type="submit" disabled={pending} className="btn btn--dark w-full disabled:opacity-60">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

const editable: OrderStatus[] = ["paid", "in_production", "ready", "out_for_delivery", "delivered", "ready_for_collection", "collected", "cancelled"];

export function StatusForm({ version, orderId, status, etaDate, note }: { version: string; orderId: string; status: OrderStatus; etaDate: string | null; note: string | null }) {
  const [state, action, pending] = useActionState(saveOrderStatus, {});
  return (
    <form action={action} className="space-y-4">
      <ErrorNote state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      {/* Remount the fields when the saved order changes, so they show what's stored. */}
      <div key={version} className="space-y-4">
      <label className="block text-sm font-medium">
        Status
        <select name="status" defaultValue={status} className={adminInput}>
          {editable.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Expected delivery / collection date
        <input name="etaDate" type="date" defaultValue={etaDate ?? ""} className={adminInput} />
      </label>
      <label className="block text-sm font-medium">
        Note for the customer <span className="font-normal text-graphite">(shown on their tracking page)</span>
        <textarea name="note" rows={3} defaultValue={note ?? ""} className={adminInput} placeholder="e.g. Oil finish drying, ready to deliver Thursday" />
      </label>
      </div>
      {state.saved && !pending && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-ink">
          <SketchIcon name="tick" size={20} /> Saved. The customer&apos;s tracking page is updated.
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn--primary w-full disabled:opacity-60">
        {pending ? "Saving…" : (
          <>
            <SketchIcon name="tick" size={20} className="[--sketch-accent:white]" /> Save and update customer
          </>
        )}
      </button>
    </form>
  );
}
