"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { adminBase, adminPassword, endAdminSession, requireAdmin, saveTotpSecret, startAdminSession, storedTotpSecret } from "@/lib/admin-auth";
import { TEMP_ADMIN_2FA_OFF } from "@/lib/admin-config";
import { type OrderStatus, orderStatuses } from "@/lib/db/schema";
import { updateOrderStatus } from "@/lib/orders";
import { allowAttempt, clearAttempts, clientIp } from "@/lib/rate-limit";
import { newTotpSecret, safeEqual, seal, totpUri, unseal, verifyTotp } from "@/lib/security";

export type FormState = {
  error?: string;
  saved?: boolean;
  /** Set when two-step sign-in is on but the authenticator app hasn't been added yet. */
  enroll?: { sealed: string; secret: string; qrSvg: string };
};

async function enrolment(secret = newTotpSecret()) {
  const qrSvg = await QRCode.toString(totpUri(secret, "Workshop admin"), { type: "svg", margin: 0, color: { dark: "#24201d", light: "#ffffff" } });
  return { sealed: seal(secret), secret, qrSvg };
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function loginAdmin(_prev: FormState, f: FormData): Promise<FormState> {
  const base = await adminBase();
  const ip = await clientIp();
  // One shared password, so also cap attempts across all addresses.
  const [ipOk, allOk] = await Promise.all([
    allowAttempt(`admin-login:ip:${ip}`, 10, 15 * 60),
    allowAttempt("admin-login:all", 50, 15 * 60),
  ]);
  if (!ipOk || !allOk) return { error: "Too many attempts. Wait 15 minutes." };

  const wrong = TEMP_ADMIN_2FA_OFF ? "That password is wrong." : "Password or code is wrong.";
  const password = adminPassword();
  if (password.length < 12 || !safeEqual(String(f.get("password") ?? ""), password)) return { error: wrong };

  if (!TEMP_ADMIN_2FA_OFF) {
    const stored = await storedTotpSecret();
    if (stored) {
      if (!verifyTotp(unseal(stored), str(f, "code"))) return { error: wrong };
    } else {
      // First sign-in since two-step sign-in was switched on: add the authenticator app now.
      const sealed = str(f, "enrollSealed");
      if (!sealed) return { enroll: await enrolment() };
      let secret: string;
      try {
        secret = unseal(sealed);
      } catch {
        return { enroll: await enrolment(), error: "That expired. Scan the new QR code." };
      }
      if (!verifyTotp(secret, str(f, "code"))) return { enroll: await enrolment(secret), error: "That code isn't right. Try the current one." };
      await saveTotpSecret(seal(secret));
    }
  }

  await clearAttempts(`admin-login:ip:${ip}`);
  await startAdminSession();
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
