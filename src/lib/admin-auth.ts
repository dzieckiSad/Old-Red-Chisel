import "server-only";
import { count, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { signToken, verifyToken } from "@/lib/security";

const COOKIE = "orc_admin";
const TTL = 60 * 60 * 8; // sign in again after 8 hours

/**
 * Public base path of the admin panel (the secret ADMIN_PATH). Only set by src/proxy.ts on
 * rewritten requests; anything reaching the internal routes without it gets a 404.
 */
export async function adminBase() {
  const base = (await headers()).get("x-admin-base");
  const expected = process.env.ADMIN_PATH?.replace(/^\/+|\/+$/g, "");
  if (!base || !expected || base !== `/${expected}`) notFound();
  return base;
}

export async function adminCount() {
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(adminUsers);
  return Number(row?.n ?? 0);
}

export async function currentAdmin() {
  await adminBase();
  const payload = verifyToken<{ adminId: string }>((await cookies()).get(COOKIE)?.value);
  if (!payload) return null;
  const db = await getDb();
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, payload.adminId));
  return admin ?? null;
}

/** Every admin action must call this first: server actions can be invoked directly. */
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) throw new Error("Not signed in");
  return admin;
}

export async function startAdminSession(adminId: string) {
  const base = await adminBase();
  (await cookies()).set(COOKIE, signToken({ adminId }, TTL), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: base,
    maxAge: TTL,
  });
}

export async function endAdminSession() {
  const base = await adminBase();
  (await cookies()).set(COOKIE, "", { path: base, maxAge: 0 });
}
