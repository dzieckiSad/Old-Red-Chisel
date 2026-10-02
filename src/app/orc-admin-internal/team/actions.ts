"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/security";

export type TeamState = { error?: string; done?: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function addAdmin(_prev: TeamState, f: FormData): Promise<TeamState> {
  await requireAdmin();
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 12) return { error: "Use a password of at least 12 characters." };
  const db = await getDb();
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email));
  if (existing) return { error: "That email already has access." };
  await db.insert(adminUsers).values({ email, passwordHash: await hashPassword(password), totpSecret: null });
  revalidatePath("/orc-admin-internal/team");
  return { done: `${email} can now sign in. Give them the password in person or by phone.` };
}

export async function removeAdmin(id: string) {
  const me = await requireAdmin();
  if (id === me.id) return;
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(adminUsers);
  if (Number(n) <= 1) return;
  await db.delete(adminUsers).where(and(eq(adminUsers.id, id), ne(adminUsers.id, me.id)));
  revalidatePath("/orc-admin-internal/team");
}

export async function changeOwnPassword(_prev: TeamState, f: FormData): Promise<TeamState> {
  const me = await requireAdmin();
  if (!(await verifyPassword(String(f.get("current") ?? ""), me.passwordHash))) return { error: "Your current password is wrong." };
  const next = String(f.get("password") ?? "");
  if (next.length < 12) return { error: "Use a password of at least 12 characters." };
  if (next !== String(f.get("password2") ?? "")) return { error: "The new passwords don't match." };
  const db = await getDb();
  await db.update(adminUsers).set({ passwordHash: await hashPassword(next) }).where(eq(adminUsers.id, me.id));
  return { done: "Password changed." };
}
