"use client";

import { useActionState } from "react";
import { type QuoteFormState, saveQuoteStatus } from "@/app/orc-admin-internal/quotes/actions";
import { adminInput } from "@/components/admin/forms";
import { SketchIcon } from "@/components/sketch/icons";
import { type QuoteStatus, quoteStatuses } from "@/lib/db/schema";

const labels: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Price sent",
  survey_booked: "Survey booked",
  won: "Won (became an order)",
  lost: "Lost / not going ahead",
};

export function QuoteStatusForm({ id, status, notes, version }: { id: string; status: QuoteStatus; notes: string; version: string }) {
  const [state, action, pending] = useActionState<QuoteFormState, FormData>(saveQuoteStatus, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      {state.error && <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>}
      {/* Remount when the saved quote changes, so the fields show what's stored. */}
      <div key={version} className="space-y-4">
        <label className="block text-sm font-medium">
          Status
          <select name="status" defaultValue={status} className={adminInput}>
            {quoteStatuses.map((s) => (
              <option key={s} value={s}>{labels[s]}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Notes <span className="font-normal text-graphite">(only you see these)</span>
          <textarea name="notes" rows={5} defaultValue={notes} className={adminInput} placeholder="e.g. Called Tue, price range €8–9k sent, survey Friday 10am" />
        </label>
      </div>
      {state.saved && !pending && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium"><SketchIcon name="tick" size={20} /> Saved.</p>
      )}
      <button type="submit" disabled={pending} className="btn btn--primary w-full disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
