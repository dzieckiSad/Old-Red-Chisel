import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { TEMP_SIMPLE_ADMIN_PATH, secretAdminPath } from "@/lib/admin-config";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { allowAttempt } from "@/lib/rate-limit";
import { signToken, verifyToken } from "@/lib/security";

const SESSION_COOKIE = "orc_admin";
const SESSION_TTL = 60 * 60 * 8; // sign in again after 8 hours
const GATE_COOKIE = "orc_gate";
const GATE_TTL = 60 * 60 * 12; // a pass from `npm run admin` lasts one working day
const TICKET_MAX_AGE = 120; // seconds between running the command and opening the link

const cookieOptions = (path: string, maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path,
  maxAge,
});

/** The public base path the request came in on, as set by src/proxy.ts. Null if not an admin request. */
export async function requestAdminBase() {
  const base = (await headers()).get("x-admin-base");
  if (!base) return null;
  if (base === secretAdminPath() || base === TEMP_SIMPLE_ADMIN_PATH) return base;
  return null;
}

/** Whether this browser may see the panel at `base` (before signing in). */
export async function hasGatePass(base: string) {
  if (base === TEMP_SIMPLE_ADMIN_PATH) return true;
  const pass = verifyToken<{ kind: string }>((await cookies()).get(GATE_COOKIE)?.value);
  return pass?.kind === "admin-gate";
}

/**
 * Public base path of the admin panel. Anything reaching the internal routes without coming
 * through the proxy, or on the secret path without a pass from `npm run admin`, gets a 404.
 */
export async function adminBase() {
  const base = await requestAdminBase();
  if (!base || !(await hasGatePass(base))) notFound();
  return base;
}

/**
 * Checks a one-time ticket made by scripts/admin.mjs: `<base64url {t, n}>.<base64url hmac>`,
 * signed with ADMIN_ACCESS_KEY, at most two minutes old, and never used before.
 */
export async function redeemTicket(ticket: string) {
  const key = process.env.ADMIN_ACCESS_KEY ?? "";
  if (key.length < 32) return false;
  const [body, sig] = ticket.split(".");
  if (!body || !sig) return false;
  const expected = createHmac("sha256", key).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  let payload: { t?: number; n?: string };
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (typeof payload.t !== "number" || typeof payload.n !== "string" || payload.n.length < 16) return false;
  if (Math.abs(Date.now() / 1000 - payload.t) > TICKET_MAX_AGE) return false;
  // Single use: the first redemption counts 1, any replay counts 2+ and is refused.
  return allowAttempt(`admin-ticket:${payload.n}`, 1, 24 * 60 * 60);
}

export async function grantGatePass(base: string) {
  (await cookies()).set(GATE_COOKIE, signToken({ kind: "admin-gate" }, GATE_TTL), cookieOptions(base, GATE_TTL));
}

export async function adminCount() {
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(adminUsers);
  return Number(row?.n ?? 0);
}

export async function currentAdmin() {
  await adminBase();
  const payload = verifyToken<{ adminId: string }>((await cookies()).get(SESSION_COOKIE)?.value);
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
  (await cookies()).set(SESSION_COOKIE, signToken({ adminId }, SESSION_TTL), {
    ...cookieOptions(base, SESSION_TTL),
    sameSite: "strict",
  });
}

export async function endAdminSession() {
  const base = await adminBase();
  (await cookies()).set(SESSION_COOKIE, "", { path: base, maxAge: 0 });
}
