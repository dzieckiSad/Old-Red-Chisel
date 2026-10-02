import "server-only";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ADMIN_PATH, TEMP_ADMIN_PASSWORD } from "@/lib/admin-config";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { adminSettings } from "@/lib/db/schema";
import { keyedDigest, signToken, verifyToken } from "@/lib/security";

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
  if (adminPassword().length < 8) {
    issues.push({ name: "ADMIN_PASSWORD", how: "Settings → Environment Variables: the panel password, 8+ characters." });
  }
  return issues;
}

/** The one shared panel password: ADMIN_PASSWORD from Vercel, else the temporary one. */
export function adminPassword() {
  return process.env.ADMIN_PASSWORD || TEMP_ADMIN_PASSWORD;
}

/** Changes whenever ADMIN_PASSWORD changes, so a new password signs everyone out. */
function passwordStamp() {
  return keyedDigest("admin-password-v1", adminPassword()).slice(0, 22);
}

/** Authenticator secret (sealed), stored once two-step sign-in is switched on. */
export async function storedTotpSecret() {
  const db = await getDb();
  const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, "totp"));
  return row?.value ?? null;
}

export async function saveTotpSecret(sealed: string) {
  const db = await getDb();
  await db.insert(adminSettings).values({ key: "totp", value: sealed }).onConflictDoUpdate({ target: adminSettings.key, set: { value: sealed } });
}

/** True when this browser is signed in to the panel. */
export async function currentAdmin() {
  await adminBase();
  if (adminConfigIssues().length) return false;
  const payload = verifyToken<{ stamp: string }>((await cookies()).get(SESSION_COOKIE)?.value);
  return payload?.stamp === passwordStamp();
}

/** Every admin action must call this first: server actions can be invoked directly. */
export async function requireAdmin() {
  if (!(await currentAdmin())) throw new Error("Not signed in");
}

export async function startAdminSession() {
  const base = await adminBase();
  (await cookies()).set(SESSION_COOKIE, signToken({ stamp: passwordStamp() }, SESSION_TTL), {
    ...cookieOptions(base, SESSION_TTL),
    sameSite: "strict",
  });
}

export async function endAdminSession() {
  const base = await adminBase();
  (await cookies()).set(SESSION_COOKIE, "", { path: base, maxAge: 0 });
}
