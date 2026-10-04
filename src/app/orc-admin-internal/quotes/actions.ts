"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminBase, requireAdmin } from "@/lib/admin-auth";
import { type QuoteStatus, quoteStatuses } from "@/lib/db/schema";
import { deleteQuote, updateQuote } from "@/lib/quotes";
import { deleteImage } from "@/lib/uploads";

export type QuoteFormState = { error?: string; saved?: boolean };

export async function saveQuoteStatus(_prev: QuoteFormState, f: FormData): Promise<QuoteFormState> {
  await requireAdmin();
  const id = String(f.get("id") ?? "");
  const status = String(f.get("status") ?? "") as QuoteStatus;
  if (!quoteStatuses.includes(status)) return { error: "Choose a status." };
  await updateQuote(id, { status, notes: String(f.get("notes") ?? "").trim().slice(0, 5000) });
  revalidatePath("/orc-admin-internal/quotes", "layout");
  return { saved: true };
}

export async function deleteQuoteAction(id: string) {
  await requireAdmin();
  const base = await adminBase();
  const removed = await deleteQuote(id);
  for (const url of removed?.photos ?? []) await deleteImage(url);
  redirect(`${base}/quotes?deleted=1`);
}
