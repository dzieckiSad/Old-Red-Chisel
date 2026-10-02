import "server-only";
import { cookies } from "next/headers";
import { getOrder } from "@/lib/orders";
import { seal, signToken, unseal, verifyToken } from "@/lib/security";

const TRACK_COOKIE = "orc_track";
const REVEAL_COOKIE = "orc_reveal";
const TRACK_TTL = 60 * 60 * 24 * 30; // 30 days
const REVEAL_TTL = 60 * 10; // the password stays on the confirmation page for 10 minutes

const secure = process.env.NODE_ENV === "production";

/** Only call from a server action or route handler. */
export async function startTrackingSession(orderId: string) {
  (await cookies()).set(TRACK_COOKIE, signToken({ orderId }, TRACK_TTL), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: TRACK_TTL,
  });
}

export async function endTrackingSession() {
  (await cookies()).delete(TRACK_COOKIE);
}

export async function trackedOrder() {
  const payload = verifyToken<{ orderId: string }>((await cookies()).get(TRACK_COOKIE)?.value);
  return payload ? getOrder(payload.orderId) : null;
}

/** Only call from a server action or route handler. */
export async function stashPasswordForDisplay(orderId: string, password: string) {
  (await cookies()).set(REVEAL_COOKIE, seal(JSON.stringify({ orderId, password })), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/order",
    maxAge: REVEAL_TTL,
  });
}

export async function stashedPassword(orderId: string) {
  const raw = (await cookies()).get(REVEAL_COOKIE)?.value;
  if (!raw) return null;
  try {
    const data = JSON.parse(unseal(raw)) as { orderId: string; password: string };
    return data.orderId === orderId ? data.password : null;
  } catch {
    return null;
  }
}
