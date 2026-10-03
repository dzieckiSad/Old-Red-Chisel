import "server-only";
import { count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { type QuoteStatus, quotes } from "@/lib/db/schema";

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = Omit<typeof quotes.$inferInsert, "id" | "status" | "notes" | "createdAt" | "updatedAt">;

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Price sent",
  survey_booked: "Survey booked",
  won: "Won",
  lost: "Lost",
};

export const openQuoteStatuses: QuoteStatus[] = ["new", "contacted", "quoted", "survey_booked"];

export async function saveQuote(q: NewQuote) {
  const db = await getDb();
  const [row] = await db.insert(quotes).values(q).returning();
  return row;
}

export async function listQuotes(statuses?: QuoteStatus[]) {
  const db = await getDb();
  return db
    .select()
    .from(quotes)
    .where(statuses ? inArray(quotes.status, statuses) : undefined)
    .orderBy(desc(quotes.createdAt))
    .limit(300);
}

export async function getQuote(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(quotes).where(eq(quotes.id, id));
  return row ?? null;
}

export async function updateQuote(id: string, update: { status: QuoteStatus; notes: string }) {
  const db = await getDb();
  await db.update(quotes).set({ ...update, updatedAt: new Date() }).where(eq(quotes.id, id));
}

export async function deleteQuote(id: string) {
  const db = await getDb();
  const [row] = await db.delete(quotes).where(eq(quotes.id, id)).returning();
  return row ?? null;
}

export async function countNewQuotes() {
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(quotes).where(eq(quotes.status, "new"));
  return Number(row?.n ?? 0);
}
