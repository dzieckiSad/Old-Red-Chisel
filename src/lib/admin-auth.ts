import "server-only";
import { count, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ADMIN_PATH } from "@/lib/admin-config";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { signToken, verifyToken } from "@/lib/security";

const SESSION_COOKIE = "orc_admin";
const SESSION_TTL = 60 * 60 * 8; // sign in again after 8 hours
const cookieOptions = (path: string, maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path,
  maxAge,
});

/**
 * Public base path of the admin panel. Requests that reach the internal routes without coming
 * through src/proxy.ts (which sets the header) get a 404.
 */
export async function adminBase() {
  if ((await headers()).get("x-admin-base") !== ADMIN_PATH) notFound();
  return ADMIN_PATH;
}

/** Settings the panel needs before it can work, in the words shown on the setup checklist. */
export function adminConfigIssues() {
  const issues: { name: string; how: string }[] = [];
  if (!isDatabaseConfigured()) {
    issues.push({ name: "Database", how: "Vercel → Storage → Create Database → Neon → connect it to this project." });
  }
  if (process.env.VERCEL && (process.env.SESSION_SECRET ?? "").length < 32) {
    issues.push({ name: "SESSION_SECRET", how: "Settings → Environment Variables: any random text of 40+ characters." });
  }
  return issues;
}

export async function adminCount() {
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(adminUsers);
  return Number(row?.n ?? 0);
}

export async function currentAdmin() {
  await adminBase();
  if (adminConfigIssues().length) return null;
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
