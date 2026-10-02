"use server";

import { redirect } from "next/navigation";
import { endTrackingSession, startTrackingSession } from "@/lib/customer-session";
import { getOrderByCode } from "@/lib/orders";
import { allowAttempt, clearAttempts, clientIp } from "@/lib/rate-limit";
import { normaliseOrderCode, verifyPassword } from "@/lib/security";

export type TrackState = { error?: string; code?: string };

const GENERIC_ERROR = "That order number and password don't match. Check the email we sent after your payment.";

export async function trackLogin(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const code = normaliseOrderCode(String(formData.get("code") ?? ""));
  const password = String(formData.get("password") ?? "").trim().toLowerCase();
  if (!code || !password) return { error: "Enter your order number and password.", code };

  const ip = await clientIp();
  const [ipOk, codeOk] = await Promise.all([
    allowAttempt(`track:ip:${ip}`, 20, 15 * 60),
    allowAttempt(`track:code:${code}`, 8, 15 * 60),
  ]);
  if (!ipOk || !codeOk) return { error: "Too many attempts. Please wait 15 minutes and try again.", code };

  const order = await getOrderByCode(code);
  // Verify against a dummy hash when the code is unknown, so timing doesn't reveal valid codes.
  const ok = await verifyPassword(
    password,
    order?.passwordHash ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
  );
  if (!order || !ok || order.status === "pending_payment") return { error: GENERIC_ERROR, code };

  await clearAttempts(`track:code:${code}`);
  await startTrackingSession(order.id);
  redirect("/track");
}

export async function trackLogout() {
  await endTrackingSession();
  redirect("/track");
}
