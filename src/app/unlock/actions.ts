"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SITE_LOCK_COOKIE, sitePassword, unlockToken } from "@/lib/site-lock";

export type UnlockState = { error?: string };

// Per server instance; enough to slow down guessing on a private preview.
const attempts = new Map<string, { n: number; since: number }>();

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function unlockSite(_prev: UnlockState, f: FormData): Promise<UnlockState> {
  const password = sitePassword();
  const next = safeNext(String(f.get("next") ?? "/"));
  if (!password) redirect(next);

  const key = "all";
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && now - entry.since < 15 * 60_000 && entry.n >= 20) return { error: "Too many attempts. Try again in 15 minutes." };
  attempts.set(key, entry && now - entry.since < 15 * 60_000 ? { n: entry.n + 1, since: entry.since } : { n: 1, since: now });

  const given = Buffer.from(String(f.get("password") ?? ""));
  const expected = Buffer.from(password);
  await new Promise((r) => setTimeout(r, 400));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return { error: "That password isn't right." };

  (await cookies()).set(SITE_LOCK_COOKIE, await unlockToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}
