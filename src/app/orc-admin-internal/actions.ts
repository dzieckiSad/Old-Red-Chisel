"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { adminBase, adminCount, endAdminSession, requireAdmin, startAdminSession } from "@/lib/admin-auth";
import { TEMP_ADMIN_2FA_OFF } from "@/lib/admin-config";
import { getDb } from "@/lib/db";
import { adminUsers, type OrderStatus, orderStatuses } from "@/lib/db/schema";
import { updateOrderStatus } from "@/lib/orders";
import { allowAttempt, clearAttempts, clientIp } from "@/lib/rate-limit";
import { hashPassword, newTotpSecret, safeEqual, seal, totpUri, unseal, verifyPassword, verifyTotp } from "@/lib/security";

export type FormState = {
  error?: string;
  email?: string;
  saved?: boolean;
  /** Set when 2FA is required but this admin hasn't added the authenticator app yet. */
  enroll?: { sealed: string; secret: string; qrSvg: string };
};

async function enrolment(email: string) {
  const secret = newTotpSecret();
  const qrSvg = await QRCode.toString(totpUri(secret, email), { type: "svg", margin: 0, color: { dark: "#24201d", light: "#ffffff" } });
  return { sealed: seal(secret), secret, qrSvg };
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function setupAdmin(_prev: FormState, f: FormData): Promise<FormState> {
  const base = await adminBase();
  if ((await adminCount()) > 0) return { error: "An admin already exists." };
  const ip = await clientIp();
  if (!(await allowAttempt(`admin-setup:${ip}`, 5, 15 * 60))) return { error: "Too many attempts. Wait 15 minutes." };

  const setupKey = process.env.ADMIN_SETUP_KEY ?? "";
  if (setupKey.length < 16 || !safeEqual(str(f, "setupKey"), setupKey)) return { error: "Setup key is wrong." };

  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 12) return { error: "Use a password of at least 12 characters." };
  if (password !== String(f.get("password2") ?? "")) return { error: "The passwords don't match." };

  let totpSecret: string | null = null;
  if (!TEMP_ADMIN_2FA_OFF) {
    let secret: string;
    try {
      secret = unseal(str(f, "totpSealed"));
    } catch {
      return { error: "The setup form expired. Reload the page and scan the new QR code." };
    }
    if (!verifyTotp(secret, str(f, "code"))) return { error: "That 6-digit code isn't right. Check the time on your phone and try again." };
    totpSecret = seal(secret);
  }

  const db = await getDb();
  const [admin] = await db
    .insert(adminUsers)
    .values({ email, passwordHash: await hashPassword(password), totpSecret })
    .returning();
  await startAdminSession(admin.id);
  redirect(base);
}

export async function loginAdmin(_prev: FormState, f: FormData): Promise<FormState> {
  const base = await adminBase();
  const email = str(f, "email").toLowerCase();
  const ip = await clientIp();
  const [ipOk, emailOk] = await Promise.all([
    allowAttempt(`admin-login:ip:${ip}`, 10, 15 * 60),
    allowAttempt(`admin-login:email:${email}`, 5, 15 * 60),
  ]);
  if (!ipOk || !emailOk) return { error: "Too many attempts. Wait 15 minutes.", email };

  const db = await getDb();
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  const passwordOk = await verifyPassword(String(f.get("password") ?? ""), admin?.passwordHash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  if (!admin || !passwordOk) return { error: TEMP_ADMIN_2FA_OFF ? "Email or password is wrong." : "Email, password or code is wrong.", email };

  if (!TEMP_ADMIN_2FA_OFF) {
    if (admin.totpSecret) {
      if (!verifyTotp(unseal(admin.totpSecret), str(f, "code"))) return { error: "Email, password or code is wrong.", email };
    } else {
      // First sign-in since 2FA was switched on: add the authenticator app now.
      const sealed = str(f, "enrollSealed");
      if (!sealed) return { email, enroll: await enrolment(email) };
      let secret: string;
      try {
        secret = unseal(sealed);
      } catch {
        return { email, enroll: await enrolment(email), error: "That expired. Scan the new QR code." };
      }
      if (!verifyTotp(secret, str(f, "code"))) {
        return { email, enroll: { sealed, secret, qrSvg: await QRCode.toString(totpUri(secret, email), { type: "svg", margin: 0 }) }, error: "That code isn't right. Try the current one." };
      }
      await db.update(adminUsers).set({ totpSecret: seal(secret) }).where(eq(adminUsers.id, admin.id));
    }
  }

  await clearAttempts(`admin-login:email:${email}`);
  await startAdminSession(admin.id);
  redirect(base);
}

export async function logoutAdmin() {
  const base = await adminBase();
  await endAdminSession();
  redirect(base);
}

export async function saveOrderStatus(_prev: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const orderId = str(f, "orderId");
  const status = str(f, "status") as OrderStatus;
  if (!orderStatuses.includes(status) || status === "pending_payment") return { error: "Choose a status." };
  const eta = str(f, "etaDate");
  if (eta && !/^\d{4}-\d{2}-\d{2}$/.test(eta)) return { error: "Choose a valid date." };
  await updateOrderStatus(orderId, { status, etaDate: eta || null, note: str(f, "note").slice(0, 1000) || null });
  revalidatePath(`/orc-admin-internal/orders/${orderId}`);
  return { saved: true };
}
