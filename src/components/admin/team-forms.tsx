"use client";

import { type FormEvent, startTransition, useActionState } from "react";
import { type TeamState, addAdmin, changeOwnPassword } from "@/app/orc-admin-internal/team/actions";
import { adminInput } from "@/components/admin/forms";
import { SketchIcon } from "@/components/sketch/icons";

/** Submits without React's automatic form reset, so typed values survive an error. */
function submitWith(action: (d: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };
}

function Result({ state }: { state: TeamState }) {
  if (state.error) return <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>;
  if (state.done) return <p role="status" className="flex items-center gap-2 text-sm font-medium"><SketchIcon name="tick" size={20} />{state.done}</p>;
  return null;
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState(addAdmin, {});
  return (
    <form onSubmit={submitWith(action)} className="space-y-4">
      <Result state={state} />
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="off" className={adminInput} />
      </label>
      <label className="block text-sm font-medium">
        Starting password <span className="font-normal text-graphite">(12+ characters; they can change it)</span>
        <input name="password" type="text" required minLength={12} autoComplete="off" className={`${adminInput} font-mono`} />
      </label>
      <button type="submit" disabled={pending} className="btn btn--primary w-full disabled:opacity-60">
        {pending ? "Adding…" : "Give access"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, {});
  return (
    <form onSubmit={submitWith(action)} className="space-y-4">
      <Result state={state} />
      <label className="block text-sm font-medium">
        Current password
        <input name="current" type="password" required autoComplete="current-password" className={adminInput} />
      </label>
      <label className="block text-sm font-medium">
        New password <span className="font-normal text-graphite">(12+ characters)</span>
        <input name="password" type="password" required minLength={12} autoComplete="new-password" className={adminInput} />
      </label>
      <label className="block text-sm font-medium">
        Repeat new password
        <input name="password2" type="password" required minLength={12} autoComplete="new-password" className={adminInput} />
      </label>
      <button type="submit" disabled={pending} className="btn btn--dark w-full disabled:opacity-60">
        {pending ? "Saving…" : "Change my password"}
      </button>
    </form>
  );
}
